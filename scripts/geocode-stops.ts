import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface StopGeo {
  lat: number;
  lng: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const routesMetaPath = path.join(__dirname, '../data/routes-meta.json');
  const routeDataPath = path.join(__dirname, '../data/routeData.js');
  const stopsGeoPath = path.join(__dirname, '../data/stops-geo.json');

  const apiKey = process.env.OPENCAGE_KEY || process.env.NEXT_PUBLIC_OPENCAGE_KEY;
  if (!apiKey) {
    console.log('No OpenCage key found in .env.local. Using Photon (komoot.io) free geocoding API.');
  } else {
    console.log('Using OpenCage API for geocoding.');
  }

  // 1. Collect all unique stop names
  const stops = new Set<string>();

  // Add stops from routes-meta.json (terminus and via)
  if (fs.existsSync(routesMetaPath)) {
    const routes = JSON.parse(fs.readFileSync(routesMetaPath, 'utf-8'));
    for (const r of routes) {
      if (r.terminus) stops.add(r.terminus);
      if (r.via) {
        for (const v of r.via) {
          stops.add(v);
        }
      }
    }
  }

  // Add stops from routeData.js
  if (fs.existsSync(routeDataPath)) {
    try {
      const jsContent = fs.readFileSync(routeDataPath, 'utf-8');
      const sandbox: any = {};
      eval(jsContent.replace(/window/g, 'sandbox'));
      const routeStopsData = sandbox.routeStopsData || {};
      for (const routeKey of Object.keys(routeStopsData)) {
        const routeData = routeStopsData[routeKey];
        if (routeData && routeData.stops) {
          for (const s of routeData.stops) {
            stops.add(s.name);
          }
        }
      }
    } catch (e: any) {
      console.error(`Failed to parse routeData.js: ${e.message}`);
    }
  }

  const uniqueStops = Array.from(stops).sort();
  console.log(`Collected ${uniqueStops.length} unique stop names.`);

  // 2. Load existing stops-geo.json if it exists (caching)
  let geoMap: Record<string, StopGeo> = {};
  if (fs.existsSync(stopsGeoPath)) {
    try {
      geoMap = JSON.parse(fs.readFileSync(stopsGeoPath, 'utf-8'));
      console.log(`Loaded ${Object.keys(geoMap).length} existing stops from ${stopsGeoPath}`);
    } catch (e: any) {
      console.error(`Failed to parse existing stops-geo.json: ${e.message}`);
    }
  }

  // 3. Geocode missing stops
  const missingStops = uniqueStops.filter(stop => !geoMap[stop]);
  console.log(`Need to geocode ${missingStops.length} new stops.`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingStops.length; i++) {
    const stop = missingStops[i];
    console.log(`[${i + 1}/${missingStops.length}] Geocoding: "${stop}"...`);

    // Special hardcoded/predefined cases
    const stopLower = stop.toLowerCase().trim();
    if (stopLower === 'kempegowda international airport' || stopLower.includes('airport') || stopLower === 'kia') {
      geoMap[stop] = { lat: 13.2001, lng: 77.7088 };
      console.log(`  Resolved (Airport hardcoded) -> 13.2001, 77.7088`);
      successCount++;
      continue;
    }

    try {
      let lat: number | null = null;
      let lng: number | null = null;

      if (apiKey) {
        // OpenCage geocoding
        const query = `${stop}, Bangalore`;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&countrycode=in&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          lat = data.results[0].geometry.lat;
          lng = data.results[0].geometry.lng;
        }
      } else {
        // Photon geocoding - coordinates are in [lng, lat]
        const query = `${stop}, Bangalore`;
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates;
          lng = coords[0];
          lat = coords[1];
        }
      }

      if (lat !== null && lng !== null) {
        geoMap[stop] = { lat, lng };
        console.log(`  Resolved -> ${lat}, ${lng}`);
        successCount++;
      } else {
        console.warn(`  Warning: No results found for "${stop}"`);
        failCount++;
      }
    } catch (error: any) {
      console.error(`  Error geocoding "${stop}": ${error.message}`);
      failCount++;
    }

    // Save intermediate results every 5 requests to avoid loss
    if (i % 5 === 0 || i === missingStops.length - 1) {
      fs.writeFileSync(stopsGeoPath, JSON.stringify(geoMap, null, 2), 'utf-8');
    }

    // Delay between requests
    const delayMs = apiKey ? 300 : 200;
    if (i < missingStops.length - 1) {
      await sleep(delayMs);
    }
  }

  // Final save
  fs.writeFileSync(stopsGeoPath, JSON.stringify(geoMap, null, 2), 'utf-8');
  console.log(`Geocoding complete. Successfully resolved: ${successCount}. Failed: ${failCount}.`);
  
  const unresolvedStops = uniqueStops.filter(stop => !geoMap[stop]);
  if (unresolvedStops.length > 0) {
    console.warn(`\n[WARNING] The following ${unresolvedStops.length} stops could not be geocoded:`);
    console.warn(JSON.stringify(unresolvedStops, null, 2));
  }
}

main();
