import { findNearestStops } from '../lib/findNearestStops';

console.log('--- RUNNING COORDINATES VERIFICATION ---');

// Test case 1: HSR Layout
console.log('\n[Case 1] HSR Layout (12.9116, 77.6389):');
const resHsr = findNearestStops(12.9116, 77.6389, 5);
resHsr.forEach((stop, i) => {
  console.log(`  ${i + 1}. Route: ${stop.routeId} | Stop: ${stop.stopName} | Distance: ${stop.distanceKm} km | Terminus: ${stop.routeTerminus}`);
});

// Test case 2: Koramangala
console.log('\n[Case 2] Koramangala (12.9352, 77.6245):');
const resKor = findNearestStops(12.9352, 77.6245, 5);
resKor.forEach((stop, i) => {
  console.log(`  ${i + 1}. Route: ${stop.routeId} | Stop: ${stop.stopName} | Distance: ${stop.distanceKm} km | Terminus: ${stop.routeTerminus}`);
});

// Test case 3: Majestic
console.log('\n[Case 3] Majestic (12.9767, 77.5713):');
const resMaj = findNearestStops(12.9767, 77.5713, 5);
resMaj.forEach((stop, i) => {
  console.log(`  ${i + 1}. Route: ${stop.routeId} | Stop: ${stop.stopName} | Distance: ${stop.distanceKm} km | Terminus: ${stop.routeTerminus}`);
});
