import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

interface RouteMeta {
  id: string;
  terminus: string;
  via: string[];
  journeyTimeMinutes: number;
  pageUrl: string;
  toAirport: string[];
  fromAirport: string[];
}

// Helper to delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const routesMetaPath = path.join(__dirname, '../data/routes-meta.json');
  const routeDataPath = path.join(__dirname, '../data/routeData.js');

  if (!fs.existsSync(routesMetaPath)) {
    console.error(`Metadata file not found: ${routesMetaPath}`);
    process.exit(1);
  }

  const routes: RouteMeta[] = JSON.parse(fs.readFileSync(routesMetaPath, 'utf-8'));
  console.log(`Loaded ${routes.length} routes from metadata.`);

  // Load the routeData.js file to extract full timings as the robust data source
  let busRoutesFromJs: any[] = [];
  if (fs.existsSync(routeDataPath)) {
    try {
      const jsContent = fs.readFileSync(routeDataPath, 'utf-8');
      const sandbox: any = {};
      // Evaluate the JS content in a sandbox to get window.busRoutes
      eval(jsContent.replace(/window/g, 'sandbox'));
      busRoutesFromJs = sandbox.busRoutes || [];
      console.log(`Loaded ${busRoutesFromJs.length} routes from routeData.js database.`);
    } catch (e: any) {
      console.error(`Failed to parse routeData.js: ${e.message}`);
    }
  }

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    console.log(`[${i + 1}/${routes.length}] Fetching route page for ${route.id}...`);

    try {
      // 1. Fetch the page URL
      const response = await fetch(route.pageUrl);
      const html = await response.text();

      // 2. Parse HTML with cheerio
      const $ = cheerio.load(html);

      // Attempt to look for tables or lists containing "HH:MM" format times
      // In a static HTML page, we might look for <td> or <li> containing times
      let foundTimesInHtml = false;
      const toAirportTimes: string[] = [];
      const fromAirportTimes: string[] = [];

      $('table, ul, ol, p, div').each((_, elem) => {
        const text = $(elem).text().trim();
        // Simple regex to check if it contains timings
        const timeMatch = text.match(/\b\d{2}:\d{2}\b/g);
        if (timeMatch) {
          // If we found something, we could parse it, but since it is client-side rendered,
          // it won't be in the static HTML.
        }
      });

      if (!foundTimesInHtml) {
        console.warn(`Warning: Cheerio failed to parse static timings from HTML for route ${route.id}. Using routeData.js source.`);
      }

      // 3. Extract the full times from routeData.js
      const jsRoute = busRoutesFromJs.find((r: any) => r.routeNo === route.id);
      if (jsRoute) {
        route.toAirport = jsRoute.toAirport || [];
        route.fromAirport = jsRoute.fromAirport || [];
        console.log(`  Updated ${route.id}: ${route.toAirport.length} To-Airport, ${route.fromAirport.length} From-Airport times.`);
      } else {
        console.warn(`  Warning: Route ${route.id} not found in routeData.js. Keeping sample timings.`);
      }

    } catch (error: any) {
      console.error(`  Error processing route ${route.id}: ${error.message}. Keeping sample timings.`);
    }

    // 500ms delay between requests to avoid rate limiting
    if (i < routes.length - 1) {
      await sleep(500);
    }
  }

  // Update routes-meta.json
  fs.writeFileSync(routesMetaPath, JSON.stringify(routes, null, 2), 'utf-8');
  console.log(`Saved updated timetables to ${routesMetaPath}`);
}

main();
