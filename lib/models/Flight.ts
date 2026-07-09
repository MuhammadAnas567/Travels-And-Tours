import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FlightSchema = new Schema(
  {
    airline: { type: String, required: true, trim: true },
    airlineLogo: { type: String, default: "" },
    flightNumber: { type: String, required: true, trim: true },
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    departTime: { type: Date, required: true, index: true },
    arriveTime: { type: Date, required: true },
    durationMins: { type: Number, required: true, min: 0 },
    stops: { type: Number, default: 0, min: 0, index: true },
    priceByClass: {
      economy: { type: Number, required: true, min: 0 },
      business: { type: Number, required: true, min: 0 },
    },
    seatsAvailable: { type: Number, default: 100, min: 0 },
  },
  { timestamps: true }
);

FlightSchema.index({ from: 1, to: 1, departTime: 1 });
FlightSchema.index({ "priceByClass.economy": 1 });

export type FlightDoc = InferSchemaType<typeof FlightSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Flight: Model<FlightDoc> =
  mongoose.models.Flight ?? mongoose.model<FlightDoc>("Flight", FlightSchema);
