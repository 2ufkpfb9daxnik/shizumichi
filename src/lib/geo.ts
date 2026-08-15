import type { LatLng } from "./types";

const R = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLength(path: LatLng[]): number {
  let sum = 0;
  for (let i = 1; i < path.length; i += 1) {
    sum += haversineMeters(path[i - 1], path[i]);
  }
  return sum;
}

export function pointAlongPath(path: LatLng[], t: number): LatLng {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1 || t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];

  const total = pathLength(path);
  let remain = total * t;
  for (let i = 1; i < path.length; i += 1) {
    const seg = haversineMeters(path[i - 1], path[i]);
    if (remain <= seg || i === path.length - 1) {
      const r = seg === 0 ? 1 : remain / seg;
      return {
        lat: path[i - 1].lat + (path[i].lat - path[i - 1].lat) * r,
        lng: path[i - 1].lng + (path[i].lng - path[i - 1].lng) * r,
      };
    }
    remain -= seg;
  }
  return path[path.length - 1];
}

export function remainingMeters(path: LatLng[], t: number): number {
  return Math.max(0, Math.round(pathLength(path) * (1 - t)));
}
