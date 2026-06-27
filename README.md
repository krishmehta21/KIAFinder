# KIA Bus Finder (Vayu Vajra Tracker) ✈️🚌

KIA Bus Finder is a premium, minimal, dark-mode transit utility web application built with **Next.js 14**, **Tailwind CSS**, and **Leaflet.js** to help travelers in Bangalore find the nearest BMTC Vayu Vajra (airport connection) bus stops and schedule timetables instantly.

---

## 🌟 Key Features

*   📍 **GPS Proximity Stop Finder**: Matches your current coordinates to the nearest Vayu Vajra stops with 100% geocoding accuracy from BMTC databases.
*   🗺️ **Interactive Transit Map**: Features custom dark tiles (CartoDB Dark), marker clustering, and a dynamic dotted routing polyline from your location directly to the selected stop.
*   📦 **Grouped Stop Timetables**: Combines adjacent stops (within 100m) serving multiple Vayu Vajra routes into a single card showing next departures and calculated airport arrival times (e.g. `Departs 17:45 (KIA-8E) → Arrives airport ~19:35`).
*   🗓️ **Dedicated Timetable View**: Displays full day-by-day timetables separated by tabs for each route, showing count of remaining departures, bolded upcoming buses, dimmed past timings, and sun/moon day-night indicator icons.
*   🚕 **Cab Booking Integration**: Allows quick deep-linking to **Uber**, **Ola**, and **Rapido** with coordinates parameters automatically set for booking a cab directly to the stop.
*   🎨 **HTML5 Canvas Backdrop**: The landing page features a custom transit canvas background simulating live locator radar scans, bouncing orbs, and GPS ping coordinates without adding heavy third-party bundle weight.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS & Vanilla CSS keyframes
*   **Icons**: Lucide React
*   **Maps**: Leaflet.js & Leaflet.markercluster (with custom React wrapper)
*   **Language**: TypeScript (Type-safe compilation)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
Clone the repository and install all required packages:
```bash
npm install
```

### 3. Compile Geocoded Data
The app uses matched BMTC coordinates. Build the geocoding pipeline:
```bash
npx tsx scripts/match-stops.ts
```

### 4. Run Development Server
Start the Next.js local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 5. Production Compilation
Generate the optimized build bundle:
```bash
npm run build
```

---

## 📝 Disclaimers
This is a utility planner. Schedules are static and based on public BMTC timetables. Always verify timings with the bus conductor or operator before boarding.
