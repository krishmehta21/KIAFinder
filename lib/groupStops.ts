import { StopMatch } from './findNearestStops';
import routesData from '../data/routes.json';
import { haversineDistance } from './haversine';

export interface MergedRouteInfo {
  routeId: string;
  routeTerminus: string;
  journeyTimeMinutes: number;
  nextToAirport: { time: string; minsFromNow: number } | null;
  nextFromAirport: { time: string; minsFromNow: number } | null;
  toAirportTimings: string[];
  fromAirportTimings: string[];
  routeTip: string | null;
}

export interface MergedStopMatch {
  stopName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  walkingMins: number;
  stopFare: number;
  routes: MergedRouteInfo[];
  bestNextToAirport: { time: string; minsFromNow: number; routeId: string } | null;
  bestNextFromAirport: { time: string; minsFromNow: number; routeId: string } | null;
}

// Helper to calculate arrival time at the airport given a departure time and duration
export function getArrivalTime(departureTime: string, journeyTimeMinutes: number): string {
  const [h, m] = departureTime.split(':').map(Number);
  let totalMins = h * 60 + m + journeyTimeMinutes;
  
  // Wrap around 24 hours
  totalMins = totalMins % 1440;
  
  const arrH = Math.floor(totalMins / 60);
  const arrM = totalMins % 60;
  
  const padH = String(arrH).padStart(2, '0');
  const padM = String(arrM).padStart(2, '0');
  
  return `${padH}:${padM}`;
}

// Custom route tip helper
function getRouteTip(stops: { name: string }[]) {
  const stopNames = stops.map(s => s.name.toLowerCase());
  if (stopNames.some(n => n.includes('m.g road') || n.includes('mg road') || n.includes('shivajinagar'))) {
    return "This route passes MG Road / Shivajinagar — ideal if you're coming from central Bangalore.";
  }
  if (stopNames.some(n => n.includes('hebbal') || n.includes('hebbala'))) {
    return "This route passes Hebbal — convenient for North Bangalore commuters.";
  }
  if (stopNames.some(n => n.includes('tin factory') || n.includes('tinfactory') || n.includes('kr puram') || n.includes('k.r.pura'))) {
    return "This route passes Tin Factory / KR Puram — good for East Bangalore access.";
  }
  if (stopNames.some(n => n.includes('silk board') || n.includes('hsr') || n.includes('jakkasandra') || n.includes('marathahalli'))) {
    return "This route passes Silk Board / Marathahalli — great for Outer Ring Road tech hubs.";
  }
  if (stopNames.some(n => n.includes('electronic city') || n.includes('ecity') || n.includes('wipro'))) {
    return "This route passes Electronic City — ideal for south-east tech corridor commuters.";
  }
  if (stopNames.some(n => n.includes('mysore road') || n.includes('yeshwanthpur') || n.includes('vijayanagar'))) {
    return "This route passes Mysore Road / Yeshwanthpur — convenient for West Bangalore travelers.";
  }
  if (stopNames.some(n => n.includes('jayanagar') || n.includes('banashankari') || n.includes('jp nagar'))) {
    return "This route passes Jayanagar / Banashankari — convenient for South Bangalore residents.";
  }
  return "This route connects several key transit intersections across Bangalore.";
}

export function groupDuplicateStops(matches: StopMatch[]): MergedStopMatch[] {
  const merged: MergedStopMatch[] = [];

  for (const match of matches) {
    const route = routesData.routes.find((r) => r.id === match.routeId);
    const toAirportTimings = route ? route.toAirport : [];
    const fromAirportTimings = route ? route.fromAirport : [];
    const stopDetail = route?.stops.find(
      (s) => s.name.toLowerCase() === match.stopName.toLowerCase()
    );
    const stopFare = stopDetail?.fare ?? 250;
    const routeTip = route ? getRouteTip(route.stops) : null;
    const journeyTimeMinutes = route?.journeyTimeMinutes ?? 100;

    const routeInfo: MergedRouteInfo = {
      routeId: match.routeId,
      routeTerminus: match.routeTerminus,
      journeyTimeMinutes,
      nextToAirport: match.nextToAirport,
      nextFromAirport: match.nextFromAirport,
      toAirportTimings,
      fromAirportTimings,
      routeTip,
    };

    // Check if we have an existing stop within 100m (0.1 km) and with the same name
    const existing = merged.find(
      (m) =>
        m.stopName.toLowerCase() === match.stopName.toLowerCase() &&
        haversineDistance(m.lat, m.lng, match.lat, match.lng) < 0.1
    );

    if (existing) {
      existing.routes.push(routeInfo);
      
      // Update best next bus to airport
      if (match.nextToAirport) {
        if (
          !existing.bestNextToAirport ||
          match.nextToAirport.minsFromNow < existing.bestNextToAirport.minsFromNow
        ) {
          existing.bestNextToAirport = {
            time: match.nextToAirport.time,
            minsFromNow: match.nextToAirport.minsFromNow,
            routeId: match.routeId,
          };
        }
      }

      // Update best next bus from airport
      if (match.nextFromAirport) {
        if (
          !existing.bestNextFromAirport ||
          match.nextFromAirport.minsFromNow < existing.bestNextFromAirport.minsFromNow
        ) {
          existing.bestNextFromAirport = {
            time: match.nextFromAirport.time,
            minsFromNow: match.nextFromAirport.minsFromNow,
            routeId: match.routeId,
          };
        }
      }
    } else {
      merged.push({
        stopName: match.stopName,
        lat: match.lat,
        lng: match.lng,
        distanceKm: match.distanceKm,
        walkingMins: match.walkingMins,
        stopFare,
        routes: [routeInfo],
        bestNextToAirport: match.nextToAirport
          ? {
              time: match.nextToAirport.time,
              minsFromNow: match.nextToAirport.minsFromNow,
              routeId: match.routeId,
            }
          : null,
        bestNextFromAirport: match.nextFromAirport
          ? {
              time: match.nextFromAirport.time,
              minsFromNow: match.nextFromAirport.minsFromNow,
              routeId: match.routeId,
            }
          : null,
      });
    }
  }

  // Sort merged stops by distance ascending
  merged.sort((a, b) => a.distanceKm - b.distanceKm);

  return merged;
}
