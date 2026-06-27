import React from 'react';
import Link from 'next/link';
import LiveTime from '../../components/LiveTime';
import ResultsContainer from '../../components/ResultsContainer';
import { findNearestStops } from '../../lib/findNearestStops';
import { groupDuplicateStops } from '../../lib/groupStops';

export const dynamic = 'force-dynamic';

interface ResultsPageProps {
  searchParams: {
    lat?: string;
    lng?: string;
    q?: string; // Query location string or 'gps'
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const latStr = searchParams.lat;
  const lngStr = searchParams.lng;
  const qStr = searchParams.q;

  const lat = latStr ? parseFloat(latStr) : null;
  const lng = lngStr ? parseFloat(lngStr) : null;

  const isValidLocation = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);
  
  // Find top 10 nearest raw stops so that after grouping we get exactly 5 unique locations
  const rawMatches = isValidLocation ? findNearestStops(lat, lng, 10) : [];
  const mergedStops = groupDuplicateStops(rawMatches).slice(0, 5);

  // Determine search title with reverse geocoding fallback for GPS
  let locationLabel = 'Near your search area';
  
  if (isValidLocation) {
    if (qStr === 'gps') {
      try {
        const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`, {
          next: { revalidate: 3600 } // Cache reverse geocode result for 1 hour
        });
        const data = await response.json();
        const feature = data.features?.[0];
        const props = feature?.properties;
        
        // Get suburb or locality name
        const areaName = props?.suburb || props?.name || props?.locality || props?.district;
        
        if (areaName && !areaName.toLowerCase().includes('bangalore') && !areaName.toLowerCase().includes('bengaluru')) {
          locationLabel = `Stops near: ${areaName}`;
        } else {
          locationLabel = 'Stops near: Your Location';
        }
      } catch (e) {
        console.error('Reverse geocoding failed:', e);
        locationLabel = 'Stops near: Your Location';
      }
    } else if (qStr) {
      locationLabel = `Stops near: ${decodeURIComponent(qStr)}`;
    }
  }

  return (
    <main className="min-h-screen bg-[#070708] text-neutral-100 p-4 sm:p-8 relative overflow-hidden select-none font-sans flex flex-col justify-between pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg mx-auto z-10 flex-1 flex flex-col">
        {/* Header Navigation */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              {/* Show searched location label */}
              <h1 className="text-lg font-bold text-white font-display leading-tight">{locationLabel}</h1>
              <p className="text-[10px] text-neutral-500 mt-0.5">Showing nearest Vayu Vajra stops</p>
            </div>
          </div>

          {/* Live time client clock */}
          <LiveTime />
        </div>

        {/* Results layout and map container */}
        {!isValidLocation ? (
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center shadow-xl">
            <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-base font-semibold text-neutral-300 mb-2">Invalid Location Coordinates</h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              No coordinates were received. Please return to the homepage and select your location.
            </p>
            <Link
              href="/"
              className="inline-block py-2.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all"
            >
              Go Back Home
            </Link>
          </div>
        ) : mergedStops.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center shadow-xl">
            <svg className="w-12 h-12 text-neutral-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-semibold text-neutral-300 mb-2">No Stops Found</h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              We couldn&apos;t locate any nearby Vayu Vajra stops within Bangalore.
            </p>
            <Link
              href="/"
              className="inline-block py-2.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all"
            >
              Go Back Home
            </Link>
          </div>
        ) : (
          <ResultsContainer userLat={lat} userLng={lng} stops={mergedStops} />
        )}
      </div>

      {/* Floating "Search again" button fixed at the bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Link
          href="/"
          className="py-3 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98] transition-all flex items-center gap-2 border border-emerald-400/25 text-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Again
        </Link>
      </div>

      {/* Footer disclaimer */}
      <div className="w-full text-center pt-10 pb-4 text-[10px] text-neutral-600 tracking-wider z-10 max-w-sm mx-auto leading-relaxed">
        Timings are scheduled, not live. Verify with driver before travel.
      </div>
    </main>
  );
}
