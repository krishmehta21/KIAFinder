import fs from 'fs';
import path from 'path';

interface StopGeo {
  lat: number;
  lng: number;
}

function main() {
  const stopsGeoPath = path.join(__dirname, '../data/stops-geo.json');

  if (!fs.existsSync(stopsGeoPath)) {
    console.error(`Stops geo file not found: ${stopsGeoPath}`);
    process.exit(1);
  }

  const geoMap: Record<string, StopGeo> = JSON.parse(fs.readFileSync(stopsGeoPath, 'utf-8'));

  const updates: Record<string, StopGeo> = {
    // Terminuses coordinates from user directive
    "HAL Main Gate": { lat: 12.9591, lng: 77.6484 },
    "Banashankari TTMC": { lat: 12.9259, lng: 77.5631 },
    "Banashankari Bus Station": { lat: 12.9259, lng: 77.5631 },
    "HSR KEB Junction": { lat: 12.9116, lng: 77.6389 },
    "HSR Layout KEB": { lat: 12.9116, lng: 77.6389 },
    "HSR KEB JUNCTION": { lat: 12.9116, lng: 77.6389 },
    "Shivajinagar Bus Stand": { lat: 12.9784, lng: 77.5996 },
    "Shivajinagar Bus station": { lat: 12.9784, lng: 77.5996 },
    "Shivajinagara Bus Station": { lat: 12.9784, lng: 77.5996 },
    "Electronic City Wipro Gate": { lat: 12.8456, lng: 77.6603 },
    "Electronic City Wipro": { lat: 12.8456, lng: 77.6603 },
    "Electronic City Wipro Gate (BACK GATE)": { lat: 12.8456, lng: 77.6603 },
    "Kempegowda Bus Station": { lat: 12.9767, lng: 77.5713 },
    "Mysore Road Bus Station": { lat: 12.9634, lng: 77.5355 },
    "Mysore Road Bus Station (MCTC)": { lat: 12.9634, lng: 77.5355 },
    "Royal Meenakshi Mall": { lat: 12.8931, lng: 77.5969 },
    "Whitefield TTMC": { lat: 12.9772, lng: 77.7268 },
    "White Field TTMC": { lat: 12.9772, lng: 77.7268 },
    "WHITE FIELD TTMC (BACK GATE)": { lat: 12.9772, lng: 77.7268 },
    "WFTTMC": { lat: 12.9772, lng: 77.7268 },
    
    // Key stops to fix
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
    "HSR BDA": { lat: 12.9114, lng: 77.6393 },
    "Bagaluru": { lat: 13.1360, lng: 77.6690 },
    "Beguru": { lat: 12.8747, lng: 77.6227 },
    "Attibele": { lat: 12.7788, lng: 77.7709 },
    "Sarjapura": { lat: 12.8617, lng: 77.7852 },
    "Sarjapura Bus station": { lat: 12.8617, lng: 77.7852 }
  };

  let appliedCount = 0;
  for (const [stopName, coords] of Object.entries(updates)) {
    geoMap[stopName] = coords;
    appliedCount++;
  }

  // Also clean up any obvious bad geocoding errors where city center stops got placed at the airport (lat > 13.15)
  // For example, if a stop like "Hebbal" or "Tin Factory" had lat > 13.15, we fixed it above.
  
  fs.writeFileSync(stopsGeoPath, JSON.stringify(geoMap, null, 2), 'utf-8');
  console.log(`Successfully updated coordinates for ${appliedCount} stops in stops-geo.json`);
}

main();
