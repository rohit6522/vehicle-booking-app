"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Navigation } from "lucide-react";

// Fix Leaflet's default marker icons breaking under webpack/Next.js bundling.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  label: string;
  value: { address: string; lat: number | null; lng: number | null };
  onChange: (v: { address: string; lat: number; lng: number }) => void;
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function RecenterMap({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

export function LocationPicker({ label, value, onChange }: Props) {
  const [query, setQuery] = useState(value.address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const marker: LatLng | null =
    value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : null;

  const searchAddress = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
    );
    const data = await res.json();
    setSuggestions(data);
  }, []);

  function handleQueryChange(v: string) {
    setQuery(v);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(v), 400);
  }

  function selectSuggestion(s: any) {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setQuery(s.display_name);
    setShowSuggestions(false);
    onChange({ address: s.display_name, lat, lng });
  }

  async function reverseGeocode(p: LatLng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}`
      );
      const data = await res.json();
      const address = data.display_name ?? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
      setQuery(address);
      onChange({ address, lat: p.lat, lng: p.lng });
    } catch {
      onChange({ address: `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`, lat: p.lat, lng: p.lng });
    }
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      reverseGeocode({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  const defaultCenter: LatLng = marker ?? { lat: 20.5937, lng: 78.9629 }; // India

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative mb-3">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for an address..."
          className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={useMyLocation}
          title="Use my current location"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
        >
          <Navigation size={15} />
        </button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-56 rounded-xl overflow-hidden border border-neutral-200">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={marker ? 15 : 5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onPick={reverseGeocode} />
          <RecenterMap center={marker} />
          {marker && <Marker position={[marker.lat, marker.lng]} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs text-neutral-400 mt-1.5">
        Search above, click the map, or tap the location icon.
      </p>
    </div>
  );
}