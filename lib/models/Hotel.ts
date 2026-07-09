import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const RoomSchema = new Schema(
  {
    type: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    beds: { type: String, required: true },
  },
  { _id: false }
);

const HotelSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    starRating: { type: Number, required: true, min: 1, max: 5, index: true },
    amenities: [{ type: String }],
    pricePerNight: { type: Number, required: true, min: 0, index: true },
    rooms: [RoomSchema],
    avgRating: { type: Number, default: 0, index: true },
    reviewCount: { type: Number, default: 0 },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

HotelSchema.index({ city: 1, pricePerNight: 1 });
HotelSchema.index({ avgRating: -1 });

export type HotelDoc = InferSchemaType<typeof HotelSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Hotel: Model<HotelDoc> =
  mongoose.models.Hotel ?? mongoose.model<HotelDoc>("Hotel", HotelSchema);
