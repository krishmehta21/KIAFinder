'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MergedStopMatch } from '../lib/groupStops';

if (typeof window !== 'undefined') {
  // Expose L to window globally so leaflet.markercluster attaches to the same instance
  (window as unknown as Record<string, unknown>).L = L;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('leaflet.markercluster');
}

// TypeScript declaration override to avoid MarkerClusterGroup compile errors
interface MapComponentProps {
  userLat: number;
  userLng: number;
  stops: MergedStopMatch[];
  selectedIndex: number;
  onSelectStop: (idx: number) => void;
}

export default function MapComponent({
  userLat,
  userLng,
  stops,
  selectedIndex,
  onSelectStop,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  // Keep track of marker cluster group
  const clusterGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([userLat, userLng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(mapRef.current);

      L.control.zoom({
        position: 'bottomright',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove existing marker cluster group if any
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    // Clear any loose layers that might remain
    map.eachLayer((layer) => {
      const iconOptions = layer instanceof L.Marker ? (layer.options.icon?.options as Record<string, unknown>) : null;
      if (layer instanceof L.Marker && !iconOptions?.className?.toString().includes('user-pin-container')) {
        map.removeLayer(layer);
      }
    });

    // Custom pulse icon for user location (Red pin)
    const userIcon = L.divIcon({
      className: 'user-pin-container',
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-rose-500/30 animate-ping"></div>
          <div class="absolute w-4 h-4 rounded-full bg-rose-500 border border-white shadow-lg"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add user marker
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindTooltip('Your Location', { permanent: false, direction: 'top' });

    // Initialize Marker Cluster Group with 30px screen radius threshold
    const clusterGroup = (L as unknown as { markerClusterGroup: (options: unknown) => L.FeatureGroup }).markerClusterGroup({
      maxClusterRadius: 30, // 30px visual screen distance clustering
      showCoverageOnHover: false,
      iconCreateFunction: function (cluster: { getChildCount: () => number }) {
        const childCount = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-black text-xs border border-emerald-400/30 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">+${childCount}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      },
    });

    const bounds = L.latLngBounds([[userLat, userLng]]);

    // Render stop markers
    stops.forEach((stop, idx) => {
      if (stop.lat && stop.lng) {
        bounds.extend([stop.lat, stop.lng]);

        // Simple colored dot or selected stop name label icon
        const isSelectedStop = idx === selectedIndex;
        
        const stopIcon = L.divIcon({
          className: isSelectedStop ? 'stop-label-icon' : 'stop-dot-icon',
          html: isSelectedStop
            ? `
              <div class="flex flex-col items-center">
                <div class="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-emerald-400 text-emerald-400 text-[10px] font-black uppercase tracking-wider shadow-2xl whitespace-nowrap mb-1.5 font-sans">
                  ${stop.stopName}
                </div>
                <div class="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-neutral-950 shadow-md ring-4 ring-emerald-500/30"></div>
              </div>
            `
            : `
              <div class="w-6 h-6 flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg-emerald-600 border border-neutral-950 hover:bg-emerald-400 shadow-md"></div>
              </div>
            `,
          iconSize: isSelectedStop ? [120, 50] : [24, 24],
          iconAnchor: isSelectedStop ? [60, 42] : [12, 12],
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon });

        // Tooltip showing stop name and route badges in dark theme format
        const routeBadges = stop.routes
          .map(
            (r) =>
              `<span class="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400 text-[8px] font-black uppercase tracking-wider">${r.routeId}</span>`
          )
          .join('');

        marker.bindTooltip(
          `
          <div class="px-3 py-2 text-xs bg-neutral-950 text-neutral-100 rounded-xl font-sans border border-neutral-850 shadow-2xl">
            <div class="font-bold text-neutral-200 mb-1.5">${stop.stopName}</div>
            <div class="flex flex-wrap gap-1">${routeBadges}</div>
          </div>
          `,
          {
            direction: 'top',
            className: 'custom-stop-tooltip',
            offset: [0, -10],
          }
        );

        marker.on('click', () => {
          onSelectStop(idx);
          const elementId = `stop-card-${idx}`;
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-emerald-500', 'scale-[1.02]');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-emerald-500', 'scale-[1.02]');
            }, 2000);
          }
        });

        clusterGroup.addLayer(marker);
      }
    });

    // Add cluster group to map
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Fit map bounds
    map.fitBounds(bounds, { padding: [40, 40] });

  }, [userLat, userLng, stops, selectedIndex, onSelectStop]);

  // Handle polyline/dotted line updates separately
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Draw dotted line to the selected stop
    const selectedStop = stops[selectedIndex];
    if (selectedStop && selectedStop.lat && selectedStop.lng) {
      const points: L.LatLngExpression[] = [
        [userLat, userLng],
        [selectedStop.lat, selectedStop.lng],
      ];
      polylineRef.current = L.polyline(points, {
        color: '#10b981', // Emerald 500
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.8,
      }).addTo(map);
    }
  }, [userLat, userLng, stops, selectedIndex]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-neutral-800/80 shadow-2xl relative">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
