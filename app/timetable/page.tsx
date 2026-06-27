'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import routesData from '../../data/routes.json';
import TimingList from '../../components/TimingList';
import { getRouteFamilyColor } from '../../lib/routeColors';

interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  isTerminus: boolean;
  fare: number;
}

interface RouteData {
  id: string;
  terminus: string;
  journeyTimeMinutes: number;
  toAirport: string[];
  fromAirport: string[];
  stops: RouteStop[];
}

function getRouteTip(stops: { name: string }[]) {
  const stopNames = stops.map(s => s.name.toLowerCase());
  if (stopNames.some(n => n.includes('m.g road') || n.includes('mg road') || n.includes('shivajinagar'))) {
    return "This route passes MG Road / Shivajinagar — ideal if you're coming from central Bangalore.";
  }
  if (stopNames.some(n => n.includes('hebbal') || n.includes('hebbala'))) {
    return "This route passes Hebbal — convenient for North Bangalore commuters.";
  }
  if (stopNames.some(n => n.includes('tin factory') || n.includes('tinfactory') || n.includes('kr puram') || n.includes('k.r.pura'))) {
    return "This route passes Tin Factory / KR Puram — good for East Bangalore access.";
  }
  if (stopNames.some(n => n.includes('silk board') || n.includes('hsr') || n.includes('jakkasandra') || n.includes('marathahalli'))) {
    return "This route passes Silk Board / Marathahalli — great for Outer Ring Road tech hubs.";
  }
  if (stopNames.some(n => n.includes('electronic city') || n.includes('ecity') || n.includes('wipro'))) {
    return "This route passes Electronic City — ideal for south-east tech corridor commuters.";
  }
  if (stopNames.some(n => n.includes('mysore road') || n.includes('yeshwanthpur') || n.includes('vijayanagar'))) {
    return "This route passes Mysore Road / Yeshwanthpur — convenient for West Bangalore travelers.";
  }
  if (stopNames.some(n => n.includes('jayanagar') || n.includes('banashankari') || n.includes('jp nagar'))) {
    return "This route passes Jayanagar / Banashankari — convenient for South Bangalore residents.";
  }
  return "This route connects several key transit intersections across Bangalore.";
}

function TimetableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stopName = searchParams.get('stopName') || 'Bus Stop';
  const routesStr = searchParams.get('routes') || '';
  const userLatStr = searchParams.get('userLat');
  const userLngStr = searchParams.get('userLng');

  const userLat = userLatStr ? parseFloat(userLatStr) : null;
  const userLng = userLngStr ? parseFloat(userLngStr) : null;

  const routeIds = routesStr ? routesStr.split(',') : [];

  // Filter and construct route details
  const routesList = (routesData.routes as unknown as RouteData[]).filter(r => routeIds.includes(r.id));
  
  // Selected route tab index
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const activeRoute = routesList[activeTabIdx];

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (userLat && userLng) {
      router.push(`/results?lat=${userLat}&lng=${userLng}&q=gps`);
    } else {
      router.push('/');
    }
  };

  if (routesList.length === 0 || !activeRoute) {
    return (
      <main className="min-h-screen bg-[#070708] text-neutral-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-8 text-center max-w-sm shadow-2xl">
          <h3 className="text-base font-semibold text-neutral-300 mb-2">No Timetable Data</h3>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            We couldn&apos;t load the timetable for this stop. Please return to search.
          </p>
          <button
            onClick={handleBack}
            className="w-full py-2.5 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-750 transition-all"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // Get coordinates for active stop to use in directions & cab chips
  const stopDetail = activeRoute.stops.find(s => s.name.toLowerCase() === stopName.toLowerCase());
  const stopLat = stopDetail?.lat ?? userLat ?? 12.9716;
  const stopLng = stopDetail?.lng ?? userLng ?? 77.5946;

  // Directions and cab URLs
  const directionsUrl = userLat && userLng
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${stopLat},${stopLng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stopName + ' Bus Stop Bangalore')}`;

  const uberUrl = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${stopLat}&dropoff[longitude]=${stopLng}&dropoff[nickname]=${encodeURIComponent(stopName)}`;
  const olaUrl = `https://book.olacabs.com/?drop_lat=${stopLat}&drop_lng=${stopLng}&drop_name=${encodeURIComponent(stopName)}`;
  const rapidoUrl = 'https://app.rapido.bike/';

  // Tip context
  const routeTip = getRouteTip(activeRoute.stops);

  return (
    <main className="min-h-screen bg-[#070708] text-neutral-100 p-4 sm:p-8 relative overflow-hidden select-none font-sans flex flex-col justify-between pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto z-10 flex-1 flex flex-col">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-800/80">
          <button
            onClick={handleBack}
            className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-white font-display tracking-tight leading-tight">{stopName}</h1>
            <p className="text-[10px] text-neutral-500 mt-0.5">Route timetables & connections</p>
          </div>
        </div>

        {/* Route Tab Switcher (if multiple routes pass this stop) */}
        {routesList.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-900">
            {routesList.map((r, idx) => {
              const isActive = idx === activeTabIdx;
              const colors = getRouteFamilyColor(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border shrink-0 ${
                    isActive
                      ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-emerald-500/10`
                      : 'bg-neutral-900/40 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                  }`}
                >
                  {r.id}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area (Breathing Room Layout) */}
        <div className="space-y-6 flex-1">
          {/* Active Route info card */}
          <div className="bg-neutral-900/40 border border-neutral-850 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Active Route
                </span>
                <h2 className="text-2xl font-black text-white mt-3 flex items-center gap-2">
                  {activeRoute.id}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  Terminus: {activeRoute.terminus}
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="block text-[9px] uppercase tracking-wider font-semibold text-neutral-500">Journey Time</span>
                <span className="text-sm font-bold text-neutral-300">~{activeRoute.journeyTimeMinutes} min</span>
              </div>
            </div>

            {routeTip && (
              <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-neutral-400 italic flex gap-2 items-start">
                <span className="text-emerald-400 shrink-0">💡</span>
                <span>{routeTip}</span>
              </div>
            )}
          </div>

          {/* Timetables Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimingList
              timings={activeRoute.toAirport}
              title="Departures to Airport"
              isToAirport={true}
            />
            <TimingList
              timings={activeRoute.fromAirport}
              title="Departures from Airport"
              isToAirport={false}
            />
          </div>
        </div>

        {/* Footer Actions (Directions + booking row same as StopCard) */}
        <div className="mt-8 pt-5 border-t border-neutral-850 space-y-4">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 text-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-bold border border-neutral-700 transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Directions
          </a>

          {/* Cab Booking Chips row */}
          <div className="pt-3 border-t border-neutral-800/40 flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold shrink-0 mr-1">Book Cab:</span>
            
            {/* Uber */}
            <a
              href={uberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-900 border border-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Uber
            </a>

            {/* Ola */}
            <a
              href={olaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-lime-600/15 text-lime-400 hover:bg-lime-600/25 border border-lime-500/20 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              Ola
            </a>

            {/* Rapido */}
            <a
              href={rapidoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Rapido
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TimetablePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070708] text-neutral-100 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TimetableContent />
    </Suspense>
  );
}
