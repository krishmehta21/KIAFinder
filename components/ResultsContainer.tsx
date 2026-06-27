'use client';

import React, { useState } from 'react';
import { MergedStopMatch } from '../lib/groupStops';
import MapComponent from './MapComponent';
import StopCard from './StopCard';

interface ResultsContainerProps {
  userLat: number;
  userLng: number;
  stops: MergedStopMatch[];
}

export default function ResultsContainer({
  userLat,
  userLng,
  stops,
}: ResultsContainerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center shadow-xl">
        <svg
          className="w-12 h-12 text-neutral-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-base font-semibold text-neutral-300 mb-2">No Stops Found</h3>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
          We couldn&apos;t locate any nearby Vayu Vajra stops within Bangalore.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
      {/* Map container - left side on desktop, top side on mobile */}
      {/* Mobile: sticky top-0, 35% height. Desktop: sticky top-24, full height (relative to viewport minus header). */}
      <div className="w-full lg:w-1/2 h-[35vh] lg:h-[calc(100vh-8rem)] min-h-[220px] lg:min-h-[500px] sticky top-0 lg:top-24 z-20 bg-[#070708] pb-2 lg:pb-0">
        <MapComponent
          userLat={userLat}
          userLng={userLng}
          stops={stops}
          selectedIndex={selectedIndex}
          onSelectStop={setSelectedIndex}
        />
      </div>

      {/* Cards List container - right side scrollable on desktop, bottom scrollable on mobile */}
      <div className="w-full lg:w-1/2 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto space-y-6 flex-1 pr-2 scrollbar-none pt-2 lg:pt-0">
        {stops.map((stop, idx) => (
          <StopCard
            key={`${stop.stopName}-${idx}`}
            stop={stop}
            index={idx}
            isSelected={selectedIndex === idx}
            onSelect={() => setSelectedIndex(idx)}
            userLat={userLat}
            userLng={userLng}
          />
        ))}
      </div>
    </div>
  );
}
