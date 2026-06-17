"use client";

import Dashboard from "./components/Dashboard";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      <Dashboard />
      <GlobalStyles />
    </main>
  );
}

function GlobalStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          button { cursor: pointer; }
          .leaflet-container {
            background: #dbeafe;
            font-family: inherit;
            height: 100%;
            overflow: hidden;
            position: relative;
            width: 100%;
            z-index: 1;
          }
          .leaflet-pane, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow,
          .leaflet-tile-container, .leaflet-pane > svg, .leaflet-pane > canvas,
          .leaflet-zoom-box, .leaflet-image-layer, .leaflet-layer {
            left: 0; position: absolute; top: 0;
          }
          .leaflet-container img { max-width: none !important; }
          .leaflet-tile { filter: saturate(0.86) contrast(0.96); user-select: none; }
          
          /* Dark mode map optimization */
          .dark .leaflet-tile {
            filter: invert(100%) hue-rotate(180deg) saturate(120%) contrast(90%);
          }
          
          .leaflet-control-container .leaflet-top, .leaflet-control-container .leaflet-bottom {
            pointer-events: none; position: absolute; z-index: 1000;
          }
          .leaflet-top { top: 0; } .leaflet-bottom { bottom: 0; }
          .leaflet-left { left: 0; } .leaflet-right { right: 0; }
          .leaflet-control { clear: both; pointer-events: auto; position: relative; z-index: 800; }
          .leaflet-left .leaflet-control { margin-left: 10px; }
          .leaflet-top .leaflet-control { margin-top: 10px; }
          .leaflet-right .leaflet-control { margin-right: 10px; }
          .leaflet-bottom .leaflet-control { margin-bottom: 10px; }
          
          .leaflet-control-zoom { 
            border: 1px solid #cbd5e1; 
            border-radius: 8px; 
            overflow: hidden; 
          }
          .dark .leaflet-control-zoom { border-color: #334155; }
          
          .leaflet-control-zoom a {
            align-items: center; background: white; color: #0f172a; display: flex;
            font-size: 18px; font-weight: 700; height: 30px; justify-content: center;
            text-decoration: none; width: 30px;
          }
          .dark .leaflet-control-zoom a { background: #0f172a; color: #f8fafc; }
          .leaflet-control-zoom a + a { border-top: 1px solid #cbd5e1; }
          .dark .leaflet-control-zoom a + a { border-top-color: #334155; }
          
          .leaflet-control-attribution { background: rgba(255, 255, 255, 0.82); font-size: 10px; padding: 2px 6px; }
          .dark .leaflet-control-attribution { background: rgba(15, 23, 42, 0.85); color: #94a3b8; }
          
          .city-marker-wrapper { background: transparent; border: 0; }
          .city-marker-pin {
            align-items: center; background: var(--marker-color); border: 3px solid #ffffff;
            border-radius: 999px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.24);
            color: var(--marker-text); display: flex; font-size: 12px; font-weight: 800;
            height: 44px; justify-content: center; line-height: 1; position: relative;
            transform: translate(4px, 4px); transition: box-shadow 160ms ease, transform 160ms ease; width: 44px;
          }
          .dark .city-marker-pin { border-color: #0f172a; }
          
          .city-marker-pin::after {
            background: inherit; border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff;
            bottom: -7px; content: ""; height: 13px; position: absolute;
            transform: rotate(45deg); width: 13px; z-index: -1;
          }
          .dark .city-marker-pin::after { border-bottom-color: #0f172a; border-right-color: #0f172a; }
          
          .city-marker-pin.is-selected, .city-marker-pin:hover {
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.32); transform: translate(4px, 1px) scale(1.08);
          }
        `,
      }}
    />
  );
}