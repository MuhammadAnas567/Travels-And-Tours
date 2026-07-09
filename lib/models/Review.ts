import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    categories: {
      cleanliness: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ hotel: 1, createdAt: -1 });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Review: Model<ReviewDoc> =
  mongoose.models.Review ?? mongoose.model<ReviewDoc>("Review", ReviewSchema);
