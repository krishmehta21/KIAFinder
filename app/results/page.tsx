import React from 'react';
import Link from 'next/link';
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
    <main className="min-h-screen bg-[#070708] text-neutral-100 relative overflow-x-hidden md:overflow-hidden select-none font-sans flex flex-col justify-between">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-none mx-auto z-10 flex-1 flex flex-col">
        {!isValidLocation ? (
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center shadow-xl max-w-lg mx-auto w-full my-auto mt-20">
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
        ) : (
          <ResultsContainer
            userLat={lat}
            userLng={lng}
            stops={mergedStops}
            locationLabel={locationLabel}
          />
        )}
      </div>
    </main>
  );
}
