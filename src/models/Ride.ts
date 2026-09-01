import mongoose, { Schema, models, model } from "mongoose";

export type RideVehicleType = "bike" | "car" | "suv" | "van";
export type RideStatus =
  | "requested"
  | "accepted"
  | "ongoing"
  | "completed"
  | "cancelled";

interface IPoint {
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface IRide extends mongoose.Document {
  rider: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  vehicleType: RideVehicleType;
  pickup: IPoint;
  drop: IPoint;
  distanceKm: number;
  fare: {
    estimated: number;
    final?: number;
  };
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: "cash" | "online";
    cashConfirmedByDriver?: boolean;
  cashConfirmedByRider?: boolean;
  paymentDisputed?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  startOtp?: string;
    trackedPath?: { lat: number; lng: number }[];

  rating?: {
    score: number;
    comment?: string;
  };
  status: RideStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: "rider" | "driver";
}
const PointSchema = new Schema<IPoint>(
  {
    address: { type: String, required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false }
);

const RideSchema = new Schema<IRide>({
  rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  driver: { type: Schema.Types.ObjectId, ref: "User" },
  vehicleType: { type: String, enum: ["bike", "car", "suv", "van"], required: true },
  pickup: { type: PointSchema, required: true },
  drop: { type: PointSchema, required: true },
  distanceKm: { type: Number, required: true },
  fare: {
    estimated: { type: Number, required: true },
    final: { type: Number },
    
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentMethod: { type: String, enum: ["cash", "online"] },
    cashConfirmedByDriver: { type: Boolean, default: false },
  cashConfirmedByRider: { type: Boolean, default: false },
  paymentDisputed: { type: Boolean, default: false },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  startOtp: String,
    trackedPath: [
    {
      lat: Number,
      lng: Number,
      _id: false,
    },
  ],

  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  
  status: {
    type: String,
    enum: ["requested", "accepted", "ongoing", "completed", "cancelled"],
    default: "requested",
  },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: { type: String, enum: ["rider", "driver"] },
});

RideSchema.index({ status: 1, vehicleType: 1 });

export default models.Ride || model<IRide>("Ride", RideSchema);