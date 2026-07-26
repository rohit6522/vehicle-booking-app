import { Bike, CarFront, Car, Bus } from "lucide-react";

export const VEHICLE_TYPES = [
  { type: "bike", label: "Bike", seats: 1, icon: Bike, desc: "2 wheeler" },
  { type: "car", label: "Car", seats: 4, icon: CarFront, desc: "4 seater" },
  { type: "suv", label: "SUV", seats: 6, icon: Car, desc: "Premium & spacious" },
  { type: "van", label: "Van", seats: 8, icon: Bus, desc: "Family & group" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["type"];

export function getSeats(type: string): number {
  return VEHICLE_TYPES.find((v) => v.type === type)?.seats ?? 1;
}