'use client';

import React from 'react';
import Link from 'next/link';
import { MergedStopMatch, getArrivalTime } from '../lib/groupStops';
import { getRouteFamilyColor } from '../lib/routeColors';

interface StopCardProps {
  stop: MergedStopMatch;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  userLat?: number;
  userLng?: number;
}

export default function StopCard({
  stop,
  index,
  isSelected,
  onSelect,
  userLat,
  userLng,
}: StopCardProps) {
  // Stop coordinates
  const stopLat = stop.lat;
  const stopLng = stop.lng;

  // Directions link (origins and destinations via GPS if available)
  const directionsUrl =
    userLat && userLng
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${stopLat},${stopLng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          stop.stopName + ' Bus Stop Bangalore'
        )}`;

  // Uber, Ola and Rapido links
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${stopLat}&dropoff[longitude]=${stopLng}&dropoff[nickname]=${encodeURIComponent(stop.stopName)}`;
  const olaUrl = `https://book.olacabs.com/?drop_lat=${stopLat}&drop_lng=${stopLng}&drop_name=${encodeURIComponent(stop.stopName)}`;
  const rapidoUrl = 'https://app.rapido.bike/';

  // Find the route that has the best next to airport time
  const bestToRoute = stop.routes.find((r) => r.routeId === stop.bestNextToAirport?.routeId);
  const toArrival = bestToRoute && stop.bestNextToAirport
    ? getArrivalTime(stop.bestNextToAirport.time, bestToRoute.journeyTimeMinutes)
    : '';

  // Find the route that has the best next from airport time
  const bestFromRoute = stop.routes.find((r) => r.routeId === stop.bestNextFromAirport?.routeId);
  const fromArrival = bestFromRoute && stop.bestNextFromAirport
    ? getArrivalTime(stop.bestNextFromAirport.time, bestFromRoute.journeyTimeMinutes)
    : '';

  const elementId = `stop-card-${index}`;

  // Link for the new full timetable page
  const timetableUrl = `/timetable?stopName=${encodeURIComponent(stop.stopName)}&routes=${stop.routes.map((r) => r.routeId).join(',')}&userLat=${userLat || ''}&userLng=${userLng || ''}`;

  return (
    <div
      id={elementId}
      onClick={onSelect}
      className={`bg-neutral-900/80 backdrop-blur-md rounded-2xl border p-5 shadow-xl hover:border-neutral-700/60 transition-all duration-300 cursor-pointer scroll-mt-28 ${
        isSelected
          ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-neutral-900'
          : 'border-neutral-800/80'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Stop Name */}
          <h3 className="text-lg font-bold text-neutral-100 mb-2 truncate">
            {stop.stopName}
          </h3>

          {/* List of route badges */}
          <div className="flex flex-wrap gap-1.5">
            {stop.routes.map((r) => {
              const colors = getRouteFamilyColor(r.routeId);
              return (
                <span
                  key={r.routeId}
                  className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {r.routeId}
                </span>
              );
            })}
          </div>
        </div>

        {/* Selected indicator checkmark or badge */}
        {isSelected && (
          <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-md uppercase tracking-wider shrink-0 select-none">
            Selected
          </span>
        )}
      </div>

      {/* Stats row: Distance & Walk Time */}
      <div className="grid grid-cols-2 gap-2 py-3 px-4 my-3 rounded-xl bg-neutral-950/40 border border-neutral-800/40 text-center">
        <div>
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Distance</span>
          <span className="text-sm font-bold text-neutral-200">~{stop.distanceKm} km</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Walk Time</span>
          <span className="text-sm font-bold text-neutral-200">~{stop.walkingMins} min</span>
        </div>
      </div>

      {/* Next Bus section */}
      <div className="mt-4 space-y-3">
        {/* Next Bus to Airport */}
        <div className="flex justify-between items-center text-sm py-2 border-b border-neutral-800/50">
          <span className="text-neutral-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            To Airport
          </span>
          <span className="font-semibold text-right flex items-center gap-1 flex-wrap justify-end">
            {stop.bestNextToAirport ? (
              <span className="text-emerald-400">
                Departs <strong className="text-emerald-400 font-bold">{stop.bestNextToAirport.time}</strong>{' '}
                <span className="text-[10px] text-neutral-500">({stop.bestNextToAirport.routeId})</span> → Arrives airport ~{toArrival}
              </span>
            ) : (
              <span className="text-neutral-500 text-xs">No more today</span>
            )}
          </span>
        </div>

        {/* Next Bus from Airport */}
        <div className="flex justify-between items-center text-sm py-2">
          <span className="text-neutral-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            From Airport
          </span>
          <span className="font-semibold text-right flex items-center gap-1 flex-wrap justify-end">
            {stop.bestNextFromAirport ? (
              <span className="text-blue-400">
                Departs <strong className="text-blue-400 font-bold">{stop.bestNextFromAirport.time}</strong>{' '}
                <span className="text-[10px] text-neutral-500">({stop.bestNextFromAirport.routeId})</span> → Arrives stop ~{fromArrival}
              </span>
            ) : (
              <span className="text-neutral-500 text-xs">No more today</span>
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-4">
        {/* Main action buttons */}
        <div className="flex gap-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent card selection click
            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700/50 hover:border-neutral-500 transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Directions
          </a>
          
          <Link
            href={timetableUrl}
            onClick={(e) => e.stopPropagation()} // Prevent card selection click
            className="flex-1 py-2.5 px-4 text-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 select-none"
          >
            View Timetable
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Compact Cab booking chips row */}
        <div
          onClick={(e) => e.stopPropagation()} // Prevent card selection click
          className="pt-2.5 border-t border-neutral-800/40 flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-none"
        >
          <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-semibold shrink-0 mr-1">Book Cab:</span>
          
          {/* Uber */}
          <a
            href={uberUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full bg-black text-white hover:bg-neutral-900 border border-neutral-800 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
          >
            <span className="w-1 h-1 rounded-full bg-white" />
            Uber
          </a>

          {/* Ola */}
          <a
            href={olaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full bg-lime-600/15 text-lime-400 hover:bg-lime-600/25 border border-lime-500/20 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            Ola
          </a>

          {/* Rapido */}
          <a
            href={rapidoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            Rapido
          </a>
        </div>
      </div>
    </div>
  );
}
