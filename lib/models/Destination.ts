import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DestinationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    priceFrom: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["beach", "city", "mountains", "adventure", "culture", "wildlife"],
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    popularity: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

DestinationSchema.index({ category: 1, popularity: -1 });

export type DestinationDoc = InferSchemaType<typeof DestinationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Destination: Model<DestinationDoc> =
  mongoose.models.Destination ??
  mongoose.model<DestinationDoc>("Destination", DestinationSchema);
