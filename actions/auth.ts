"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { AuthError } from "next-auth";

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

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: { email: ["Email already registered"] } };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, hashedPassword },
    });
  } catch (error) {
    console.error("[registerUser]", error);
    return {
      error: {
        _form: [
          "Account service unavailable. Check DATABASE_URL and try again.",
        ],
      },
    };
  }

  // Client completes sign-in so callbackUrl is preserved
  return { success: true };
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  const email = parsed.data.email.trim().toLowerCase();

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
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists
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
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      subject: "Reset your UEB3 Travel password",
      html: `
        <h1>Password reset</h1>
        <p>Click the link below to choose a new password. It expires in one hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  } catch (err) {
    console.error("[requestPasswordReset] email failed", err);
  }

  // Always log in local/dev when Resend is not configured
  console.log(`[password-reset] ${email}: ${resetUrl}`);
  return {
    success: true,
    message: "If an account exists, a reset link was sent. Check your inbox (and server logs in local dev).",
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
