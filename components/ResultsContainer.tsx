'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MergedStopMatch } from '../lib/groupStops';
import MapComponent from './MapComponent';
import StopCard from './StopCard';
import LiveTime from './LiveTime';

interface ResultsContainerProps {
  userLat: number;
  userLng: number;
  stops: MergedStopMatch[];
  locationLabel: string;
}

export default function ResultsContainer({
  userLat,
  userLng,
  stops,
  locationLabel,
}: ResultsContainerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!stops || stops.length === 0) {
    return (
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-8 text-center shadow-xl max-w-lg mx-auto w-full my-auto">
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
          We couldn&apos;t locate any Vayu Vajra stops within Bangalore.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-[45%_55%] md:h-screen md:w-screen relative">
      {/* Map Container */}
      {/* Mobile: stacked top (40vh). Desktop: left column (45%), sticky top 0, height 100vh, overflow hidden. */}
      <div className="w-full md:w-full h-[40vh] md:h-screen md:sticky md:top-0 md:left-0 z-20 md:overflow-hidden bg-[#070708] pb-2 md:pb-0">
        <MapComponent
          userLat={userLat}
          userLng={userLng}
          stops={stops}
          selectedIndex={selectedIndex}
          onSelectStop={setSelectedIndex}
        />
      </div>

      {/* Cards Panel Container */}
      {/* Mobile: stacked bottom. Desktop: right column (55%), height 100vh, overflow-y auto, padding 16px (represented by p-4 md:p-8) */}
      <div className="w-full md:h-screen md:overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scrollbar-none pb-28 md:pb-28">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
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
              <h1 className="text-lg font-bold text-white font-display leading-tight">{locationLabel}</h1>
              <p className="text-[10px] text-neutral-500 mt-0.5">Showing nearest Vayu Vajra stops</p>
            </div>
          </div>

          {/* Live time client clock */}
          <LiveTime />
        </div>

        {/* Cards list */}
        <div className="space-y-6 flex-1">
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

        {/* Footer disclaimer inside scroll panel */}
        <div className="w-full text-center pt-6 text-[10px] text-neutral-600 tracking-wider z-10 max-w-sm mx-auto leading-relaxed">
          Timings are scheduled, not live. Verify with driver before travel.
        </div>
      </div>

      {/* Floating "Search again" button fixed at the bottom center */}
      {/* Mobile: centered over full viewport. Desktop: centered over right-hand cards panel (left 72.5% offset). */}
      <div className="fixed bottom-6 left-1/2 md:left-[72.5%] -translate-x-1/2 z-50">
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
    </div>
  );
}
