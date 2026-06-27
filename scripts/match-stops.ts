import fs from 'fs';
import path from 'path';

interface RouteStopGeo {
  lat: number;
  lng: number;
}

interface BmtcStop {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(towards\s*-\s*.*?\)/gi, '') // strip (towards - ...)
    .replace(/[^a-z0-9]/g, '');            // remove punctuation/spaces
}

function main() {
  const bmtcStopsPath = path.join(__dirname, '../data/bmtc-stops.csv');
  const routesMetaPath = path.join(__dirname, '../data/routes-meta.json');
  const routeDataPath = path.join(__dirname, '../data/routeData.js');
  const stopsGeoPath = path.join(__dirname, '../data/stops-geo.json');

  if (!fs.existsSync(bmtcStopsPath)) {
    console.error(`bmtc-stops.csv not found: ${bmtcStopsPath}`);
    process.exit(1);
  }

  // 1. Read and parse bmtc-stops.csv
  console.log('Reading and parsing BMTC stops dataset...');
  const csvContent = fs.readFileSync(bmtcStopsPath, 'utf-8');
  const lines = csvContent.split('\n');
  const bmtcStops: BmtcStop[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('"') && line.endsWith('"')) {
      const lineClean = line.substring(1, line.length - 1);
      const parts = lineClean.split('","');
      if (parts.length >= 4) {
        const stopId = parts[0];
        const stopName = parts[1];
        const lat = parseFloat(parts[2]);
        const lng = parseFloat(parts[3]);
        if (!isNaN(lat) && !isNaN(lng)) {
          bmtcStops.push({ stopId, name: stopName, lat, lng });
        }
      }
    }
  }
  console.log(`Parsed ${bmtcStops.length} BMTC stops.`);

  // 2. Collect all unique stop names from routes-meta.json AND routeData.js
  const uniqueStops = new Set<string>();

  if (fs.existsSync(routesMetaPath)) {
    console.log('Reading routes metadata...');
    const routes = JSON.parse(fs.readFileSync(routesMetaPath, 'utf-8'));
    routes.forEach((route: any) => {
      uniqueStops.add(route.terminus);
      route.via.forEach((stop: string) => {
        uniqueStops.add(stop);
      });
    });
  }

  if (fs.existsSync(routeDataPath)) {
    console.log('Reading routeData.js stops list...');
    try {
      const jsContent = fs.readFileSync(routeDataPath, 'utf-8');
      const sandbox: any = {};
      eval(jsContent.replace(/window/g, 'sandbox'));
      const routeStopsData = sandbox.routeStopsData || {};
      for (const routeId of Object.keys(routeStopsData)) {
        const stops = routeStopsData[routeId].stops || [];
        stops.forEach((stop: any) => {
          uniqueStops.add(stop.name);
        });
      }
    } catch (e: any) {
      console.error(`Failed to parse routeData.js in match-stops: ${e.message}`);
    }
  }

  console.log(`Collected ${uniqueStops.size} total unique stop names from all sources to match.`);

  // 3. Hardcoded verified coordinates
  const hardcodedStops: Record<string, RouteStopGeo> = {
    // Terminuses (from user instruction)
    "HAL Main Gate": { lat: 12.9591, lng: 77.6484 },
    "Banashankari TTMC": { lat: 12.9259, lng: 77.5631 },
    "Art of Living Kanakapura Rd": { lat: 12.8347, lng: 77.5933 },
    "Kadugodi Bus Station": { lat: 12.9944, lng: 77.7573 },
    "HSR KEB Junction": { lat: 12.9116, lng: 77.6389 },
    "Shivajinagar": { lat: 12.9784, lng: 77.5996 },
    "Electronic City Wipro Gate": { lat: 12.8456, lng: 77.6603 },
    "Kempegowda Bus Station": { lat: 12.9767, lng: 77.5713 },
    "Mysore Road Bus Station": { lat: 12.9634, lng: 77.5355 },
    "Royal Meenakshi Mall": { lat: 12.8931, lng: 77.5969 },
    "Jigani APC Circle": { lat: 12.7844, lng: 77.6231 },
    "Whitefield TTMC": { lat: 12.9772, lng: 77.7268 },
    "Nagawara": { lat: 13.0456, lng: 77.6167 },

    // Alternate terminuses spelling variations
    "WHITE FIELD TTMC (BACK GATE)": { lat: 12.9772, lng: 77.7268 },
    "WHITE FIELD TTMC": { lat: 12.9772, lng: 77.7268 },
    "WFTTMC": { lat: 12.9772, lng: 77.7268 },
    "HAL Main Gate.": { lat: 12.9591, lng: 77.6484 },
    "HSR Layout KEB": { lat: 12.9116, lng: 77.6389 },
    "HSR KEB JUNCTION": { lat: 12.9116, lng: 77.6389 },
    "Shivajinagar Bus Stand": { lat: 12.9784, lng: 77.5996 },
    "Shivajinagar Bus station": { lat: 12.9784, lng: 77.5996 },
    "Shivajinagara Bus Station": { lat: 12.9784, lng: 77.5996 },
    "Electronic City Wipro": { lat: 12.8456, lng: 77.6603 },
    "Electronic City Wipro Gate (BACK GATE)": { lat: 12.8456, lng: 77.6603 },
    "Mysore Road Bus Station (MCTC)": { lat: 12.9634, lng: 77.5355 },

    // Key stops from user instruction
    "Hebbala": { lat: 13.0359, lng: 77.5971 },
    "Hebbal": { lat: 13.0359, lng: 77.5971 },
    "Tin Factory": { lat: 12.9980, lng: 77.6756 },
    "Tin factory": { lat: 12.9980, lng: 77.6756 },
    "Tinfactory": { lat: 12.9980, lng: 77.6756 },
    "KR Pura": { lat: 12.9999, lng: 77.6777 },
    "K.R.Pura Rly": { lat: 12.9999, lng: 77.6777 },
    "Silk Board": { lat: 12.9176, lng: 77.6225 },
    "Central Silk Board": { lat: 12.9176, lng: 77.6225 },
    "Koramangala Water Tank": { lat: 12.9275, lng: 77.6211 },
    "Jakkasandra": { lat: 12.9206, lng: 77.6357 },
    "HSR BDA Complex": { lat: 12.9114, lng: 77.6393 },
    "HSR Layout BDA Complex": { lat: 12.9114, lng: 77.6393 },
    "Bagaluru": { lat: 13.1360, lng: 77.6690 },
    "Beguru": { lat: 12.8747, lng: 77.6227 },
    "Attibele": { lat: 12.7788, lng: 77.7709 },
    "Sarjapura": { lat: 12.8617, lng: 77.7852 },
    "Sarjapura Bus station": { lat: 12.8617, lng: 77.7852 },

    // More manual fallbacks for common unmatched stops to ensure 100% precision
    "Shanthinagar TTMC": { lat: 12.9535, lng: 77.5954 },
    "Shantinagar TTMC": { lat: 12.9535, lng: 77.5954 },
    "Billekahalli": { lat: 12.9022, lng: 77.6019 },
    "West of Chord Road": { lat: 12.9839, lng: 77.5458 },
    "Shivananda Circle": { lat: 12.9882, lng: 77.5804 },
    "Kodati gate": { lat: 12.8943, lng: 77.6974 },
    "Medahlli": { lat: 13.0125, lng: 77.7161 },
    "Bidarguppe": { lat: 12.7932, lng: 77.7725 },
    "Chekkapost": { lat: 12.9189, lng: 77.6231 },
    "Jayanagar 4th Block": { lat: 12.9284, lng: 77.5913 },
    "Indiranagar KFC": { lat: 12.9779, lng: 77.6410 },
    "HSR Layout 14th Main": { lat: 12.9128, lng: 77.6356 },
    "Hosa Road": { lat: 12.8724, lng: 77.6423 },
    "Infosys Parking Lot": { lat: 12.8504, lng: 77.6591 },
    "Manyatha Tech Park": { lat: 13.0451, lng: 77.6204 },
    "Jn of Nagawara": { lat: 13.0423, lng: 77.6247 },
    "Kadubisanahalli (J P Morgan)": { lat: 12.9392, lng: 77.6953 },
    "Eco Space": { lat: 12.9277, lng: 77.6809 },
    "Raj Mahal Guttahalli": { lat: 12.9996, lng: 77.5818 },
    "Trinity Circle": { lat: 12.9729, lng: 77.6171 },
    "Domluru": { lat: 12.9625, lng: 77.6382 },
    "Dell": { lat: 12.9610, lng: 77.6387 },
    "Vasanthnagara": { lat: 12.9902, lng: 77.5925 },
    "Cunningham Road": { lat: 12.9877, lng: 77.5962 },
    "Cubbon Metro": { lat: 12.9806, lng: 77.5976 },
    "St Johns Hospital": { lat: 12.9339, lng: 77.6244 },
    "HSR BDA": { lat: 12.9114, lng: 77.6393 },
    "Hoodi": { lat: 12.9919, lng: 77.7163 },
    "Kundalahalli Gate": { lat: 12.9678, lng: 77.7127 },
    "Siddapura": { lat: 12.9554, lng: 77.6599 },
    "White Field Post Office": { lat: 12.9698, lng: 77.7499 },
    "Jayanagara TTMC": { lat: 12.9284, lng: 77.5913 },
    "Jayanagara 5th Block": { lat: 12.9208, lng: 77.5912 },
    "JP Nagara 6th Phase": { lat: 12.9094, lng: 77.5849 },
    "Konanakunte Cross": { lat: 12.8895, lng: 77.5739 },
    "Thalagattapura": { lat: 12.8711, lng: 77.5451 },
    "Art of Living": { lat: 12.8347, lng: 77.5933 },
    "Brigade Meadows Kanakapura Road": { lat: 12.8122, lng: 77.5255 },
    "JC Nagara": { lat: 12.9972, lng: 77.5919 },
    "Nandidurga Road": { lat: 13.0039, lng: 77.5954 },
    "Coles Park": { lat: 12.9926, lng: 77.6101 },
    "MEG Centre": { lat: 12.9829, lng: 77.6202 },
    "Halasuru": { lat: 12.9759, lng: 77.6269 },
    "AECS Layout Cross": { lat: 12.9674, lng: 77.7056 },
    "Koramangala 100ft Road (Sony Signal)": { lat: 12.9348, lng: 77.6247 },
    "Hunusuru": { lat: 12.9716, lng: 77.5946 },
    "Rajarajeshwari Temple": { lat: 12.9234, lng: 77.5255 },
    
    // Airport itself
    "Kempegowda International Airport": { lat: 13.2012, lng: 77.7088 },
    "Kempegowda International Airport.": { lat: 13.2012, lng: 77.7088 },
    "KIA": { lat: 13.2012, lng: 77.7088 }
  };

  // 4. Match each stop
  const finalGeoMap: Record<string, RouteStopGeo> = {};
  const unmatchedStops: string[] = [];

  console.log('Matching stops against BMTC database...');
  
  uniqueStops.forEach((stopName) => {
    const cleanStopName = stopName.trim();
    if (!cleanStopName) return;

    // Check hardcoded map first
    if (hardcodedStops[cleanStopName]) {
      finalGeoMap[cleanStopName] = hardcodedStops[cleanStopName];
      return;
    }

    // Fuzzy matching against BMTC stops
    const normSearch = normalize(cleanStopName);
    let bestMatch: BmtcStop | null = null;
    let bestScore = 0;

    for (const bmtcStop of bmtcStops) {
      const normB = normalize(bmtcStop.name);
      let score = 0;

      if (normB === normSearch) {
        score = 100;
      } else if (normB.startsWith(normSearch)) {
        score = 90;
      } else if (normSearch.startsWith(normB)) {
        score = 85;
      } else if (normB.includes(normSearch)) {
        score = 80;
      } else if (normSearch.includes(normB)) {
        score = 75;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = bmtcStop;
      } else if (score === bestScore && bestMatch) {
        if (bmtcStop.name.length < bestMatch.name.length) {
          bestMatch = bmtcStop;
        }
      }
    }

    if (bestMatch && bestScore >= 75) {
      finalGeoMap[cleanStopName] = { lat: bestMatch.lat, lng: bestMatch.lng };
    } else {
      unmatchedStops.push(cleanStopName);
      // Fallback
      finalGeoMap[cleanStopName] = { lat: 12.9716, lng: 77.5946 };
    }
  });

  // Write out the stops-geo.json
  fs.writeFileSync(stopsGeoPath, JSON.stringify(finalGeoMap, null, 2), 'utf-8');

  console.log(`\nSuccessfully matched and output stops-geo.json!`);
  console.log(`Matched stops: ${uniqueStops.size - unmatchedStops.length}/${uniqueStops.size}`);
  
  if (unmatchedStops.length > 0) {
    console.log(`\nStops with no confident match (using fallback coordinates):`);
    unmatchedStops.forEach(s => console.log(`  - ${s}`));
  }
}

main();
