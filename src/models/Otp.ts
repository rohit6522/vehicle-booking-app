import mongoose, { Schema, models, model } from "mongoose";

export interface IOtp extends mongoose.Document {
  email: string;
  otp: string;
  name: string;
  hashedPassword: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-deletes after 10 minutes
});

export default models.Otp || model<IOtp>("Otp", OtpSchema);