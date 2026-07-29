"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";
import { safeCallbackUrl } from "@/lib/safe-callback-url";
import {
  generateSignupOtp,
  hashSignupOtp,
  signupOtpExpiry,
} from "@/lib/auth/otp";
import { sendEmail, sendSignupOtpEmail } from "@/lib/email";

async function issueSignupOtp(email: string, name?: string | null) {
  const otp = generateSignupOtp();
  const token = hashSignupOtp(otp);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: signupOtpExpiry(),
    },
  });

  await sendSignupOtpEmail({ to: email, name, otp });
}

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.hashedPassword && existing.emailVerified) {
      return { error: { email: ["Email already registered"] } };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existing) {
      await prisma.user.update({
        where: { email },
        data: {
          name: name.trim() || existing.name,
          hashedPassword,
          emailVerified: null,
        },
      });
    } else {
      await prisma.user.create({
        data: { name, email, hashedPassword, emailVerified: null },
      });
    }

    await issueSignupOtp(email, name);
  } catch (error) {
    console.error("[registerUser]", error);
    const message =
      error instanceof Error && error.message.toLowerCase().includes("resend")
        ? error.message
        : error instanceof Error && error.message.includes("RESEND_API_KEY")
          ? error.message
          : error instanceof Error && /email|resend|forbidden|invalid/i.test(error.message)
            ? `Could not send verification email: ${error.message}`
            : "Account service unavailable. Check DATABASE_URL / RESEND_API_KEY and try again.";

    return {
      error: {
        _form: [message],
      },
    };
  }

  return { success: true, needsVerification: true, email };
}

export async function verifySignupOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return { error: "Enter the 6-digit code from your email." };
  }

  const token = hashSignupOtp(otp);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token },
  });

  if (!record || record.expires < new Date()) {
    return { error: "Invalid or expired code. Request a new one." };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  return { success: true, email };
}

export async function resendSignupOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Email is required" };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true, hashedPassword: true, emailVerified: true },
  });

  if (!user?.hashedPassword) {
    // Do not reveal whether the account exists
    return { success: true };
  }
  if (user.emailVerified) {
    return { success: true, alreadyVerified: true };
  }

  try {
    await issueSignupOtp(email, user.name);
    return { success: true };
  } catch (error) {
    console.error("[resendSignupOtp]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not resend the code. Try again shortly.",
    };
  }
}

export async function assertCredentialsLogin(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { hashedPassword: true, emailVerified: true },
  });

  if (!user?.hashedPassword) {
    return { error: { _form: ["Email or password is incorrect."] } };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.hashedPassword);
  if (!valid) {
    return { error: { _form: ["Email or password is incorrect."] } };
  }

  if (!user.emailVerified) {
    return {
      needsVerification: true as const,
      email,
      error: {
        _form: ["Verify your email with the OTP we sent before signing in."],
      },
    };
  }

  return { ok: true as const, email };
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const callbackUrl = safeCallbackUrl(
    formData.get("callbackUrl") as string | null,
    "/dashboard"
  );

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { hashedPassword: true, emailVerified: true },
  });

  if (user?.hashedPassword && !user.emailVerified) {
    const valid = await bcrypt.compare(parsed.data.password, user.hashedPassword);
    if (valid) {
      return {
        error: {
          _form: ["Verify your email with the OTP we sent before signing in."],
        },
        needsVerification: true,
        email,
      };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: {
          _form: [
            "Invalid email or password. On live: open /api/health — if DATABASE_URL or demoUserExists is false, set Atlas URI + AUTH_SECRET on Vercel and Redeploy. Demo: user@example.com / user123",
          ],
        },
      };
    }
    // Successful signIn throws a NEXT_REDIRECT — must rethrow
    throw error;
  }
}

export async function updateProfile(formData: FormData) {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) return { error: "Name and email are required" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email },
  });

  return { success: true };
}

export async function requestPasswordReset(formData: FormData) {
  const rawEmail = formData.get("email") as string;
  if (!rawEmail) return { error: "Email is required" };
  const email = rawEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: "If an account exists, a reset link was sent." };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600000);

  await prisma.passwordResetToken.deleteMany({ where: { email } });
  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: "Reset your Arreat Travels & Tours password",
      html: `
        <h1>Password reset</h1>
        <p>Click the link below to choose a new password. It expires in one hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  } catch (err) {
    console.error("[requestPasswordReset] email failed", err);
    return {
      error: "Could not send the reset email. Check RESEND_API_KEY and try again.",
    };
  }

  return {
    success: true,
    message: "If an account exists, a reset link was sent. Check your inbox.",
  };
}

export async function resetPassword(token: string, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) return { error: "Password too short" };
  if (password !== confirmPassword) return { error: "Passwords do not match" };

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "Invalid or expired reset link" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { email: resetToken.email },
    data: { hashedPassword },
  });
  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true };
}
