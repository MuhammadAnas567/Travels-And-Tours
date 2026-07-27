/**
 * Legacy Mongoose User model — DO NOT use for auth.
 * NextAuth / Prisma owns the `User` collection (`hashedPassword`).
 * Creating docs here with `passwordHash` breaks login.
 * Prefer Prisma `prisma.user` for all account operations.
 */
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Hotel" }],
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> =
  mongoose.models.User ?? mongoose.model<UserDoc>("User", UserSchema);
