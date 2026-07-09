import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TravelerSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
  { _id: false }
);

const BookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["hotel", "flight", "package"], required: true },
    item: { type: Schema.Types.ObjectId, required: true, refPath: "type" },
    travelers: [TravelerSchema],
    dates: {
      checkIn: { type: Date },
      checkOut: { type: Date },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["confirmed", "cancelled", "pending"], default: "confirmed" },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
    bookingReference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type BookingDoc = InferSchemaType<typeof BookingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Booking: Model<BookingDoc> =
  mongoose.models.Booking ?? mongoose.model<BookingDoc>("Booking", BookingSchema);
