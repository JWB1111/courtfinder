const EARTH_RADIUS_KM = 6371

/** Haversine great-circle distance between two lat/lng points */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

export const AACHEN_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_CITY_LAT ?? 50.7753),
  lng: Number(process.env.NEXT_PUBLIC_CITY_LNG ?? 6.0839),
}
