import fs from 'fs';
import path from 'path';

interface RouteMeta {
  id: string;
  terminus: string;
  via: string[];
  journeyTimeMinutes: number;
  pageUrl: string;
  toAirport: string[];
  fromAirport: string[];
}

interface StopGeo {
  lat: number;
  lng: number;
}

interface FinalStop {
  name: string;
  lat: number;
  lng: number;
  isTerminus: boolean;
  fare?: number;
}

interface FinalRoute {
  id: string;
  terminus: string;
  journeyTimeMinutes: number;
  stops: FinalStop[];
  toAirport: string[];
  fromAirport: string[];
}

function main() {
  const routesMetaPath = path.join(__dirname, '../data/routes-meta.json');
  const routeDataPath = path.join(__dirname, '../data/routeData.js');
  const stopsGeoPath = path.join(__dirname, '../data/stops-geo.json');
  const finalOutputPath = path.join(__dirname, '../data/routes.json');

  if (!fs.existsSync(routesMetaPath)) {
    console.error(`Metadata file not found: ${routesMetaPath}`);
    process.exit(1);
  }

  // Load files
  const routesMeta: RouteMeta[] = JSON.parse(fs.readFileSync(routesMetaPath, 'utf-8'));
  
  let geoMap: Record<string, StopGeo> = {};
  if (fs.existsSync(stopsGeoPath)) {
    geoMap = JSON.parse(fs.readFileSync(stopsGeoPath, 'utf-8'));
  } else {
    console.warn(`Stops geocoding file not found: ${stopsGeoPath}. Using empty geo map.`);
  }

  // Load routeData.js for stops list and fares
  let routeStopsData: Record<string, { stops: { name: string; fare: number }[] }> = {};
  if (fs.existsSync(routeDataPath)) {
    try {
      const jsContent = fs.readFileSync(routeDataPath, 'utf-8');
      const sandbox: any = {};
      eval(jsContent.replace(/window/g, 'sandbox'));
      routeStopsData = sandbox.routeStopsData || {};
    } catch (e: any) {
      console.error(`Failed to parse routeData.js: ${e.message}`);
    }
  }

  // Helper to find coordinates with case-insensitive matching
  const findCoords = (name: string): StopGeo => {
    const clean = name.trim().toLowerCase();
    
    // Specific predefined manual geocoding fallbacks for the 9 unresolved stops
    const manualFallbacks: Record<string, StopGeo> = {
      'bidarguppe': { lat: 12.7869, lng: 77.7886 },
      'hennur cross tin factory': { lat: 13.0286, lng: 77.6253 },
      'hunasamaranahalli': { lat: 13.1256, lng: 77.6186 },
      'hunasmarenahalli': { lat: 13.1256, lng: 77.6186 },
      'jigani apc circle': { lat: 12.7844, lng: 77.6231 },
      'silk institute (nice road junction)': { lat: 12.8631, lng: 77.5458 },
      'tinfactory': { lat: 12.9987, lng: 77.6731 },
      'wfttmc': { lat: 12.9772, lng: 77.7268 },
      'white field ttmc (back gate)': { lat: 12.9772, lng: 77.7268 }
    };
    if (manualFallbacks[clean]) {
      return manualFallbacks[clean];
    }

    // Direct match
    if (geoMap[name]) return geoMap[name];
    
    // Case-insensitive match
    for (const key of Object.keys(geoMap)) {
      if (key.trim().toLowerCase() === clean) {
        return geoMap[key];
      }
    }

    // Try partial match or removing punctuation
    const stripped = clean.replace(/[^a-z0-9]/g, '');
    for (const key of Object.keys(geoMap)) {
      const keyStripped = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyStripped === stripped && stripped.length > 2) {
        return geoMap[key];
      }
    }

    // Default fallback to Bangalore city center (or airport if it is airport)
    if (clean.includes('airport') || clean === 'kia') {
      return { lat: 13.2001, lng: 77.7088 };
    }
    
    console.warn(`    Warning: Coordinate not found for stop "${name}". Using Bangalore center fallback.`);
    return { lat: 12.9716, lng: 77.5946 };
  };

  const finalRoutes: FinalRoute[] = [];

  for (const route of routesMeta) {
    console.log(`Processing route ${route.id}...`);

    let finalStops: FinalStop[] = [];

    // Check if route has stop sequence in routeStopsData
    const hasStopsData = routeStopsData[route.id] && routeStopsData[route.id].stops;

    if (hasStopsData) {
      // Use stops list from routeStopsData
      const rawStops = routeStopsData[route.id].stops;
      for (const stop of rawStops) {
        const coords = findCoords(stop.name);
        
        // Is it a terminus? (It's a terminus if it is the city terminus or airport,
        // or matches the route terminus name)
        const isTerminus = 
          stop.name.toLowerCase().includes('airport') || 
          stop.name.toLowerCase().trim() === route.terminus.toLowerCase().trim();

        finalStops.push({
          name: stop.name,
          lat: coords.lat,
          lng: coords.lng,
          isTerminus,
          fare: stop.fare,
        });
      }
    } else {
      // Fallback: Construct stops from via list and terminus
      // Order: Airport -> via stops -> terminus (or vice versa)
      const stopsSequence: string[] = ['Kempegowda International Airport', ...route.via, route.terminus];
      
      for (let idx = 0; idx < stopsSequence.length; idx++) {
        const name = stopsSequence[idx];
        const coords = findCoords(name);
        
        const isTerminus = (idx === 0 || idx === stopsSequence.length - 1);
        // Fallback fare
        const fare = isTerminus && idx === 0 ? 0 : 250; // default Vayu Vajra fare is around ₹250

        finalStops.push({
          name,
          lat: coords.lat,
          lng: coords.lng,
          isTerminus,
          fare,
        });
      }
    }

    finalRoutes.push({
      id: route.id,
      terminus: route.terminus,
      journeyTimeMinutes: route.journeyTimeMinutes,
      stops: finalStops,
      toAirport: route.toAirport,
      fromAirport: route.fromAirport,
    });
  }

  // Save final routes.json
  fs.writeFileSync(finalOutputPath, JSON.stringify({ routes: finalRoutes }, null, 2), 'utf-8');
  console.log(`Successfully built final routes.json at ${finalOutputPath}`);
}

main();
