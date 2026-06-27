import routesData from '../data/routes.json';
import { haversineDistance } from './haversine';
import { getNextBus } from './getNextBus';

export interface StopMatch {
  stopName: string;
  routeId: string;
  routeTerminus: string;
  distanceKm: number;
  walkingMins: number; // distanceKm / 0.083 (5km/h walking)
  nextToAirport: { time: string; minsFromNow: number } | null;
  nextFromAirport: { time: string; minsFromNow: number } | null;
  lat: number;
  lng: number;
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  isTerminus: boolean;
  fare: number;
}

export interface Route {
  id: string;
  terminus: string;
  journeyTimeMinutes: number;
  toAirport: string[];
  fromAirport: string[];
  stops: RouteStop[];
}

export function findNearestStops(userLat: number, userLng: number, topN = 5): StopMatch[] {
  const routeTerminusDistances: { route: Route; distance: number }[] = [];

  // Cast routes data to type Route[]
  // Since routesData is parsed from a JSON, we cast via unknown to Route[]
  const routes = (routesData.routes as unknown) as Route[];

  // 1. Calculate distance from user to each route's city terminus
  for (const route of routes) {
    // Find the city terminus stop (isTerminus = true and not the airport itself)
    const terminusStop = route.stops.find(s => 
      s.isTerminus && 
      !s.name.toLowerCase().includes('airport') && 
      s.name.toLowerCase() !== 'kia'
    ) || route.stops[route.stops.length - 1]; // fallback to last stop if not found

    const distance = haversineDistance(userLat, userLng, terminusStop.lat, terminusStop.lng);
    routeTerminusDistances.push({ route, distance });
  }

  // 2. Sort routes by terminus distance ascending
  routeTerminusDistances.sort((a, b) => a.distance - b.distance);

  // 3. For the top N closest routes, find the physically nearest stop on that route
  const matches: StopMatch[] = [];
  const topRoutes = routeTerminusDistances.slice(0, topN);

  for (const item of topRoutes) {
    const route = item.route;
    
    let closestStop = route.stops[0];
    let minStopDist = Infinity;

    for (const stop of route.stops) {
      // Skip the airport itself as a walking destination
      if (stop.name.toLowerCase().includes('airport') || stop.name.toLowerCase() === 'kia') {
        continue;
      }

      const dist = haversineDistance(userLat, userLng, stop.lat, stop.lng);
      if (dist < minStopDist) {
        minStopDist = dist;
        closestStop = stop;
      }
    }

    if (minStopDist !== Infinity) {
      const walkingMins = Math.round(minStopDist / 0.083);
      const nextToAirport = getNextBus(route.toAirport);
      const nextFromAirport = getNextBus(route.fromAirport);

      matches.push({
        stopName: closestStop.name,
        routeId: route.id,
        routeTerminus: route.terminus,
        distanceKm: Number(minStopDist.toFixed(2)),
        walkingMins,
        nextToAirport,
        nextFromAirport,
        lat: closestStop.lat,
        lng: closestStop.lng,
      });
    }
  }

  // 4. Sort matches by the actual walking distance to the stop so the absolute closest is first
  matches.sort((a, b) => a.distanceKm - b.distanceKm);

  return matches;
}
