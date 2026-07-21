import type { RideVehicleType } from "@/models/Ride";

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Haversine formula — great-circle distance between two lat/lng points, in km.
 */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

interface FareRate {
  base: number; // flat starting fare
  perKm: number; // rate per km
  perMinute: number; // rate per minute (rough estimate: assume ~2 min/km in city traffic)
  minFare: number;
}

// Placeholder rates — tune these to your market. All amounts in INR.
export const FARE_RATES: Record<RideVehicleType, FareRate> = {
  bike: { base: 20, perKm: 6, perMinute: 1, minFare: 30 },
  car: { base: 40, perKm: 12, perMinute: 1.5, minFare: 60 },
  suv: { base: 60, perKm: 16, perMinute: 2, minFare: 90 },
  van: { base: 80, perKm: 20, perMinute: 2.5, minFare: 120 },
};

export function estimateFare(km: number, vehicleType: RideVehicleType) {
  const rate = FARE_RATES[vehicleType];
  const estimatedMinutes = km * 2.5; // rough city-traffic assumption
  const raw = rate.base + km * rate.perKm + estimatedMinutes * rate.perMinute;
  const fare = Math.max(raw, rate.minFare);
  return Math.round(fare);
}