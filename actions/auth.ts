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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: { email: ["Email already registered"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, hashedPassword },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { _form: ["Registration succeeded but sign-in failed"] } };
    }
    throw error;
  }
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

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { _form: ["Invalid email or password"] } };
    }
    throw error;
  }
}

export async function updateProfile(formData: FormData) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
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

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  // In production, send email with reset link
  console.log(`Password reset token for ${email}: ${token}`);
  return { success: true, message: "If an account exists, a reset link was sent." };
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
