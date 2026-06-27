import React from 'react';
import { getISTTime } from '../lib/getNextBus';

interface TimingListProps {
  timings: string[];
  title: string;
  isToAirport: boolean;
}

export default function TimingList({ timings, title, isToAirport }: TimingListProps) {
  if (!timings || timings.length === 0) {
    return (
      <div className="bg-neutral-850/40 rounded-xl p-4 border border-neutral-800/50">
        <h4 className="text-sm font-semibold text-neutral-400 mb-2">{title}</h4>
        <p className="text-xs text-neutral-500">No scheduled buses for this direction.</p>
      </div>
    );
  }

  // Get current IST time for comparison
  const { hour: currentHour, minute: currentMinute } = getISTTime();
  const currentMins = currentHour * 60 + currentMinute;

  // Process timings to determine past vs future
  // We sort them to ensure correct order
  const sortedTimings = [...timings].sort((a, b) => {
    const [hA, mA] = a.split(':').map(Number);
    const [hB, mB] = b.split(':').map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  let nextBusIndex = -1;
  let remainingCount = 0;

  const processedTimings = sortedTimings.map((time, idx) => {
    const [h, m] = time.split(':').map(Number);
    const busMins = h * 60 + m;
    const hasPassed = busMins <= currentMins;

    // Day/Night indicator (night is between 20:00 and 05:00)
    const isNight = h >= 20 || h < 5;

    if (!hasPassed) {
      remainingCount++;
      if (nextBusIndex === -1) {
        nextBusIndex = idx; // First future bus is the next upcoming bus
      }
    }

    return {
      time,
      hasPassed,
      isNight,
      idx,
    };
  });

  return (
    <div className="bg-neutral-850/30 rounded-xl p-4 border border-neutral-800/40">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isToAirport ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          {title}
        </h4>
        <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full text-neutral-400 font-mono">
          {remainingCount} remaining today
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {processedTimings.map((item) => {
          const isNext = item.idx === nextBusIndex;

          return (
            <div
              key={item.idx}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
                item.hasPassed
                  ? 'bg-neutral-950/20 text-neutral-600 border-neutral-900 line-through'
                  : isNext
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/60 font-black shadow shadow-emerald-500/5 scale-[1.02] ring-1 ring-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              <span>{item.time}</span>
              <span className={`text-[10px] ${item.hasPassed ? 'opacity-30' : ''}`} title={item.isNight ? 'Night Route' : 'Day Route'}>
                {item.isNight ? '🌙' : '☀️'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
