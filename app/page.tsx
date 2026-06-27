'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bus } from 'lucide-react';
import TransitBackground from '../components/TransitBackground';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const popularAreas = ['Koramangala', 'Indiranagar', 'Majestic', 'HSR Layout'];

  // Geolocation trigger
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/results?lat=${latitude}&lng=${longitude}&q=gps`);
      },
      (error) => {
        setIsLoading(false);
        console.error('GPS error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission denied. Please allow location access or type your area.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is unavailable. Try typing your area.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Try typing your area.');
            break;
          default:
            setErrorMessage('Could not retrieve GPS location. Try typing your area.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search geocode and redirect
  const performGeocodeAndRedirect = async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_KEY;
      let lat: number | null = null;
      let lng: number | null = null;

      if (apiKey) {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query + ' Bangalore'
        )}&key=${apiKey}&countrycode=in&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          lat = data.results[0].geometry.lat;
          lng = data.results[0].geometry.lng;
        }
      } else {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query + ' Bangalore'
        )}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates;
          lng = coords[0];
          lat = coords[1];
        }
      }

      if (lat !== null && lng !== null) {
        router.push(`/results?lat=${lat}&lng=${lng}&q=${encodeURIComponent(query)}`);
      } else {
        setIsLoading(false);
        setErrorMessage(`Could not find coordinates for "${query}". Try typing a main junction or area.`);
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Geocoding error:', err);
      setErrorMessage('Search failed due to a network error. Please try again.');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performGeocodeAndRedirect(searchQuery.trim());
  };

  const handleChipClick = (area: string) => {
    setSearchQuery(area);
    performGeocodeAndRedirect(area);
  };

  return (
    <>
      {/* Dynamic Canvas Transit Background */}
      <TransitBackground />

      {/* Main Content Layout Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* Top Header Section */}
        <div className="text-center pt-4 flex flex-col items-center max-w-md mx-auto">
          {/* Outlined badge */}
          <span className="inline-flex px-3.5 py-1 rounded-full border border-white/10 text-neutral-300 bg-white/5 text-[9px] font-black tracking-widest uppercase mb-4">
            BMTC Vayu Vajra · Bangalore Airport
          </span>
          
          {/* Bus Icon */}
          <Bus size={32} className="text-green-500 mb-3" />
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2 font-display bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
            KIA Bus Finder
          </h1>

          {/* Subtitle with pulsing green dot */}
          <div className="flex items-center justify-center text-neutral-400 text-sm max-w-xs mx-auto mt-1 select-none">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
            <span>Find your nearest airport bus, instantly.</span>
          </div>
        </div>

        {/* Search Card Section (Glassmorphism layout) */}
        <div className="w-full max-w-md mx-auto py-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 items-start leading-relaxed animate-fadeIn">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errorMessage}
              </div>
            )}

            {/* GPS Trigger Button */}
            <Button
              onClick={handleGPSLocation}
              disabled={isLoading}
              variant="default"
              size="xl"
              className="w-full py-4 text-neutral-950 bg-green-500 hover:bg-green-400 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 font-black"
            >
              {isLoading && searchQuery === '' ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              Use My Location
            </Button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <hr className="border-white/10" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 px-3.5 text-[9px] uppercase font-black tracking-widest text-neutral-500">
                or search area
              </span>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-neutral-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                
                <label htmlFor="area-input" className="sr-only">Area Name</label>
                <input
                  id="area-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Hebbal, Whitefield, Silk Board..."
                  disabled={isLoading}
                  className="pl-11 pr-5 w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/20 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-green-500/20 disabled:opacity-50 transition-all font-mono"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                variant="secondary"
                size="default"
                className="w-full py-3.5 h-12 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading && searchQuery.trim() && !popularAreas.includes(searchQuery) ? (
                  <div className="w-4 h-4 border-2 border-neutral-200 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Find Stops'
                )}
              </Button>
            </form>

            {/* Popular Search Chips Row */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <span className="block text-[10px] uppercase font-black tracking-wider text-neutral-500 mb-3">
                Popular Searches
              </span>
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none -mx-1 px-1">
                {popularAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleChipClick(area)}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-400 hover:text-white border border-white/5 hover:border-white/10 disabled:opacity-50 transition-all font-mono active:scale-95 shrink-0"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Value Highlights Row */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-around text-neutral-500 text-[10px] uppercase font-black tracking-wider">
              <div className="flex items-center gap-1.5">
                <span>📍</span>
                <span>Nearest Stop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🕐</span>
                <span>Live Timings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🚕</span>
                <span>Book a Cab</span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="w-full text-center pb-4 text-[10px] text-neutral-600 tracking-wider z-10 max-w-sm mx-auto leading-relaxed">
          Timings are scheduled, not live. Verify before travel.
        </div>
      </div>
    </>
  );
}
