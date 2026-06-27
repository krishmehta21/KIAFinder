import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Define structures
interface RouteMetaOutput {
  id: string;
  terminus: string;
  via: string[];
  journeyTimeMinutes: number;
  pageUrl: string;
  toAirport: string[];
  fromAirport: string[];
}

function parseJourneyTime(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(?:Journey Time:\s*)?(\d+):(\d+)/i);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
  const singleNumberMatch = timeStr.match(/(\d+)/);
  if (singleNumberMatch) {
    return parseInt(singleNumberMatch[1], 10) * 60;
  }
  return 0;
}

function main() {
  const csvFilePath = path.join(__dirname, '../data/scraped-routes.csv');
  const outputFilePath = path.join(__dirname, '../data/routes-meta.json');

  console.log(`Reading CSV from: ${csvFilePath}`);
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  // Parse CSV
  const records: any[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const routesMap = new Map<string, RouteMetaOutput>();

  for (const record of records) {
    const title = record.title_1 || record.ttle_1 || '';
    if (!title) continue;

    // Format: "KIA-15A - KIA-WHITE FIELD TTMC (BACK GATE)" or "KIA-8 - KIA- Electronic City"
    const parts = title.split(' - ');
    if (parts.length < 2) {
      console.warn(`Skipping invalid title format: ${title}`);
      continue;
    }

    const routeId = parts[0].trim();
    const rawTerminus = parts.slice(1).join(' - ').trim();
    
    // Clean terminus name (remove leading "KIA-", "KIA -", "KIA ", etc.)
    const terminus = rawTerminus
      .replace(/^KIA\s*-\s*/i, '')
      .replace(/^KIA\s+/i, '')
      .trim();

    // Clean via stops
    const viaStr = record.route_via || '';
    const via = viaStr
      .replace(/^Via:\s*/i, '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const journeyTimeStr = record.journey_time || '';
    const journeyTimeMinutes = parseJourneyTime(journeyTimeStr);

    const pageUrl = record.item_page_link || '';

    // Sample timings as fallback or initial fill
    const sampleToAirport = record.to_airport_departures
      ? record.to_airport_departures.split('\n').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];
    const sampleFromAirport = record.from_airport_departures
      ? record.from_airport_departures.split('\n').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      : [];

    routesMap.set(routeId, {
      id: routeId,
      terminus,
      via,
      journeyTimeMinutes,
      pageUrl,
      toAirport: sampleToAirport,
      fromAirport: sampleFromAirport,
    });
  }

  const routesList = Array.from(routesMap.values());
  
  // Ensure the data directory exists
  const dataDir = path.dirname(outputFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(routesList, null, 2), 'utf-8');
  console.log(`Successfully parsed ${routesList.length} routes. Output written to: ${outputFilePath}`);
}

main();
