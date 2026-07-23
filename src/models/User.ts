import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "rider" | "driver" | "admin";
export type KycStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface IVehicle {
  type: "bike" | "auto" | "car" | "premium";
  make?: string;
  model?: string;
  numberPlate?: string;
  color?: string;
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string; // hashed, optional because OAuth users won't have one
  phone?: string;
  role: UserRole;
  avatarUrl?: string;

  // Driver-only fields
  vehicle?: IVehicle;
  documents?: {
    aadhaarUrl?: string;
    licenseUrl?: string;
    rcUrl?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
    mobile?: string;
    upi?: string;
  };
  partnerStep?: "vehicle" | "documents" | "bank" | "submitted";
  kycStatus?: KycStatus;
  partnerStatus?: "not_applied" | "pending" | "approved" | "rejected";
  kycVideoUrl?: string;
  isOnline?: boolean;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  rating?: number;

  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    type: { type: String, enum: ["bike", "auto", "car", "premium"] },
    make: String,
    model: String,
    numberPlate: String,
    color: String,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: { type: String },
    role: { type: String, enum: ["rider", "driver", "admin"], default: "rider" },
    avatarUrl: String,

    vehicle: VehicleSchema,
    documents: {
      aadhaarUrl: String,
      licenseUrl: String,
      rcUrl: String,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      mobile: String,
      upi: String,
    },
    partnerStep: {
      type: String,
      enum: ["vehicle", "documents", "bank", "submitted"],
    },
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "approved", "rejected"],
      default: "not_submitted",
    },
    partnerStatus: {
      type: String,
      enum: ["not_applied", "pending", "approved", "rejected"],
      default: "not_applied",
    },
    kycVideoUrl: String,
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Enables geospatial queries for "find nearby drivers"
UserSchema.index({ currentLocation: "2dsphere" });

export default models.User || model<IUser>("User", UserSchema);