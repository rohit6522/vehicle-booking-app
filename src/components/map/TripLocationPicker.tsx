"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Search, Navigation, MapPin, Home, Briefcase, Star, Plus, X } from "lucide-react";

const pickupIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Point {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface SavedAddress {
  _id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FitBounds({ pickup, drop }: { pickup: Point; drop: Point }) {
  const map = useMap();
  useEffect(() => {
    if (pickup.lat != null && drop.lat != null) {
      map.fitBounds(
        [
          [pickup.lat, pickup.lng!],
          [drop.lat!, drop.lng!],
        ],
        { padding: [40, 40], maxZoom: 15 }
      );
    } else if (pickup.lat != null) {
      map.setView([pickup.lat, pickup.lng!], 14);
    } else if (drop.lat != null) {
      map.setView([drop.lat!, drop.lng!], 14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup.lat, pickup.lng, drop.lat, drop.lng]);
  return null;
}

function addressIconFor(label: string) {
  const l = label.toLowerCase();
  if (l === "home") return Home;
  if (l === "work") return Briefcase;
  return Star;
}

export function TripLocationPicker({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
}: {
  pickup: Point;
  drop: Point;
  onPickupChange: (v: Point) => void;
  onDropChange: (v: Point) => void;
}) {
  const [active, setActive] = useState<"pickup" | "drop">("pickup");
  const [queries, setQueries] = useState({ pickup: pickup.address, drop: drop.address });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const setValue = active === "pickup" ? onPickupChange : onDropChange;
  const currentPoint = active === "pickup" ? pickup : drop;

  useEffect(() => {
    fetch("/api/saved-addresses")
      .then((res) => res.json())
      .then((data) => setSaved(data.addresses ?? []))
      .catch(() => {});
  }, []);

  const searchAddress = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`
    );
    setSuggestions(await res.json());
  }, []);

  function handleQueryChange(v: string) {
    setQueries((q) => ({ ...q, [active]: v }));
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(v), 400);
  }

  function selectSuggestion(s: any) {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setQueries((q) => ({ ...q, [active]: s.display_name }));
    setShowSuggestions(false);
    setValue({ address: s.display_name, lat, lng });
    if (active === "pickup") setActive("drop");
  }

  function selectSaved(a: SavedAddress) {
    setQueries((q) => ({ ...q, [active]: a.address }));
    setShowSuggestions(false);
    setValue({ address: a.address, lat: a.lat, lng: a.lng });
    if (active === "pickup") setActive("drop");
  }

  async function reverseGeocode(p: LatLng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}`
      );
      const data = await res.json();
      const address = data.display_name ?? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
      setQueries((q) => ({ ...q, [active]: address }));
      setValue({ address, lat: p.lat, lng: p.lng });
      if (active === "pickup") setActive("drop");
    } catch {
      const address = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;
      setQueries((q) => ({ ...q, [active]: address }));
      setValue({ address, lat: p.lat, lng: p.lng });
    }
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      reverseGeocode({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }

  async function handleSaveAddress() {
    if (!currentPoint.lat || !currentPoint.lng || !saveLabel.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/saved-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: saveLabel.trim(),
          address: currentPoint.address,
          lat: currentPoint.lat,
          lng: currentPoint.lng,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(data.addresses);
        setShowSaveForm(false);
        setSaveLabel("");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSaved(id: string) {
    const res = await fetch(`/api/saved-addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.addresses);
    }
  }

  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  return (
    <div>
      {/* Saved address quick-select chips */}
      {saved.length > 0 && (
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          {saved.map((a) => {
            const Icon = addressIconFor(a.label);
            return (
              <div key={a._id} className="relative flex-shrink-0 group">
                <button
                  type="button"
                  onClick={() => selectSaved(a)}
                  className="flex items-center gap-1.5 pl-3 pr-7 py-2 rounded-full border border-neutral-200 text-xs font-medium text-neutral-700 hover:border-black whitespace-nowrap"
                >
                  <Icon size={12} />
                  {a.label}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSaved(a._id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-red-500"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-neutral-200 rounded-xl overflow-hidden mb-1">
        {(["pickup", "drop"] as const).map((key) => (
          <div
            key={key}
            className={`flex items-center gap-2 px-3 py-2.5 ${
              key === "pickup" ? "border-b border-neutral-200" : ""
            } ${active === key ? "bg-neutral-50" : ""}`}
          >
            <MapPin
              size={14}
              className={key === "pickup" ? "text-emerald-500" : "text-red-500"}
            />
            <input
              value={queries[key]}
              onFocus={() => {
                setActive(key);
                setShowSuggestions(true);
              }}
              onChange={(e) => {
                setActive(key);
                handleQueryChange(e.target.value);
              }}
              placeholder={key === "pickup" ? "Pickup location" : "Drop location"}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            {key === "pickup" && (
              <button
                type="button"
                onClick={() => {
                  setActive("pickup");
                  useMyLocation();
                }}
                title="Use my current location"
                className="text-neutral-400 hover:text-black"
              >
                <Navigation size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Save current location */}
      <div className="mb-3">
        {showSaveForm ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              placeholder="Label (e.g. Home, Work)"
              maxLength={30}
              className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-black"
            />
            <button
              type="button"
              onClick={handleSaveAddress}
              disabled={!saveLabel.trim() || saving}
              className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold disabled:opacity-40"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-xs text-neutral-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          currentPoint.lat != null && (
            <button
              type="button"
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-black mt-1"
            >
              <Plus size={12} />
              Save {active} as a favorite
            </button>
          )
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="relative z-[1000] -mt-2 mb-3 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-44 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="flex items-start gap-2 w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
            >
              <Search size={13} className="mt-0.5 text-neutral-400 flex-shrink-0" />
              {s.display_name}
            </button>
          ))}
        </div>
      )}

      <div className="h-64 rounded-xl overflow-hidden border border-neutral-200">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={5}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <ClickHandler onPick={reverseGeocode} />
          <FitBounds pickup={pickup} drop={drop} />
          {pickup.lat != null && (
            <Marker position={[pickup.lat, pickup.lng!]} icon={pickupIcon} />
          )}
          {drop.lat != null && <Marker position={[drop.lat, drop.lng!]} icon={dropIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs text-neutral-400 mt-1.5">
        Editing <span className="font-medium">{active === "pickup" ? "pickup" : "drop"}</span> —
        search above or tap the map.
      </p>
    </div>
  );
}