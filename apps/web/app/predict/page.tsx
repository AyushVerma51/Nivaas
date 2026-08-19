"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  fetchEstimate,
  formatInr,
  type EstimateResult,
} from "@/lib/estimate";

const PredictMap = dynamic(() => import("@/components/map/PredictMap"), { ssr: false });

interface AddressRecord {
  address: string;
  lat: number;
  lng: number;
}

export default function PredictPage() {
  // All 10 model features — defaults
  const [postedBy, setPostedBy] = useState<"owner" | "dealer" | "builder">("owner");
  const [underConstruction, setUnderConstruction] = useState(false);
  const [reraApproved, setReraApproved] = useState(true);
  const [bhkNo, setBhkNo] = useState(3);
  const [unitType, setUnitType] = useState<"bhk" | "rk">("bhk");
  const [squareFt, setSquareFt] = useState(1500);
  const [readyToMove, setReadyToMove] = useState(true);
  const [isResale, setIsResale] = useState(false);
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

  // Address autocomplete
  const [addressText, setAddressText] = useState("");
  const [allAddresses, setAllAddresses] = useState<AddressRecord[]>([]);
  const [suggestions, setSuggestions] = useState<AddressRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressRecord | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load addresses from CSV data
  useEffect(() => {
    fetch("/addresses.json")
      .then((r) => r.json())
      .then((data: AddressRecord[]) => setAllAddresses(data))
      .catch(() => {});
  }, []);

  // Filter suggestions on type
  useEffect(() => {
    if (addressText.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = addressText.toLowerCase();
    const filtered = allAddresses
      .filter((a) => a.address.toLowerCase().includes(q))
      .slice(0, 8);
    setSuggestions(filtered);
  }, [addressText, allAddresses]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectAddress(addr: AddressRecord) {
    setAddressText(addr.address);
    setSelectedAddress(addr);
    setLat(addr.lat);
    setLng(addr.lng);
    setShowSuggestions(false);
  }

  const runPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchEstimate({
        posted_by: postedBy,
        under_construction: underConstruction,
        rera_approved: reraApproved,
        bedrooms: bhkNo,
        unit_type: unitType,
        area_sqft: squareFt,
        ready_to_move: readyToMove,
        is_resale: isResale,
        location: { lat, lng },
      });
      setResult(res);
    } catch {
      setError("Unable to estimate — ML service may be offline. Start it with: npm run dev:ml");
    } finally {
      setLoading(false);
    }
  }, [postedBy, underConstruction, reraApproved, bhkNo, unitType, squareFt, readyToMove, isResale, lat, lng]);

  const verdictColors: Record<string, string> = {
    great_deal: "text-emerald-700 bg-emerald-50",
    fair: "text-amber-700 bg-amber-50",
    overpriced: "text-red-700 bg-red-50",
  };

  const verdictLabels: Record<string, string> = {
    great_deal: "Great deal",
    fair: "Fair value",
    overpriced: "Overpriced",
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
      <p className="eyebrow">Price Prediction</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05]">
        Predict Property Price
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/65">
        Enter property details below to get an ML model powered price estimate.
      </p>

      {/* Form */}
      <div className="mt-8 rounded-md border border-ink/10 bg-paper p-6">
        {/* Address (typeable autocomplete) */}
        <label className="relative block text-sm">
          <span className="text-ink/60">Address</span>
          <input
            type="text"
            value={addressText}
            onChange={(e) => {
              setAddressText(e.target.value);
              setSelectedAddress(null);
              setShowSuggestions(true);
            }}
            onFocus={() => addressText.length >= 2 && setShowSuggestions(true)}
            placeholder="Type to search addresses..."
            className="mt-1 block w-full rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-clay focus:outline-none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-sm border border-ink/15 bg-paper shadow-lg"
            >
              {suggestions.map((addr) => (
                <button
                  key={addr.address}
                  type="button"
                  onClick={() => selectAddress(addr)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-canvas-2/60"
                >
                  <span className="text-ink">{addr.address}</span>
                  <span className="ml-2 text-xs text-ink/40">
                    ({addr.lat.toFixed(3)}, {addr.lng.toFixed(3)})
                  </span>
                </button>
              ))}
            </div>
          )}
        </label>

        {/* Posted By */}
        <label className="mt-4 block text-sm">
          <span className="text-ink/60">Posted By</span>
          <select
            value={postedBy}
            onChange={(e) => setPostedBy(e.target.value as typeof postedBy)}
            className="mt-1 block w-full rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-clay focus:outline-none"
          >
            <option value="owner">Owner</option>
            <option value="dealer">Dealer</option>
            <option value="builder">Builder</option>
          </select>
        </label>

        {/* BHK + Property Type */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-ink/60">BHK</span>
            <input
              type="number"
              min={1}
              max={20}
              value={bhkNo}
              onChange={(e) => setBhkNo(Math.max(1, Number(e.target.value)))}
              className="mt-1 block w-full rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink/60">Property Type</span>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as typeof unitType)}
              className="mt-1 block w-full rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="bhk">BHK</option>
              <option value="rk">RK (Room Kitchen)</option>
            </select>
          </label>
        </div>

        {/* Area */}
        <label className="mt-4 block text-sm">
          <span className="text-ink/60">Area (sq.ft)</span>
          <input
            type="number"
            min={100}
            step={10}
            value={squareFt}
            onChange={(e) => setSquareFt(Math.max(100, Number(e.target.value)))}
            className="mt-1 block w-full rounded-sm border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-clay focus:outline-none"
          />
        </label>

        {/* Boolean toggles */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={underConstruction}
              onChange={(e) => setUnderConstruction(e.target.checked)}
              className="accent-ink"
            />
            <span className="text-ink/60">Under Construction</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reraApproved}
              onChange={(e) => setReraApproved(e.target.checked)}
              className="accent-ink"
            />
            <span className="text-ink/60">RERA Approved</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={readyToMove}
              onChange={(e) => setReadyToMove(e.target.checked)}
              className="accent-ink"
            />
            <span className="text-ink/60">Ready to Move</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isResale}
              onChange={(e) => setIsResale(e.target.checked)}
              className="accent-ink"
            />
            <span className="text-ink/60">Resale Property</span>
          </label>
        </div>

        {/* Location display */}
        <div className="mt-4 rounded-sm bg-canvas-2/60 p-3 text-sm">
          <span className="text-ink/60">Coordinates</span>
          <p className="mt-0.5 font-medium text-ink">
            Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
          </p>
        </div>

        {/* Predict button */}
        <button
          onClick={runPrediction}
          disabled={loading}
          className="mt-6 w-full rounded-sm bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors duration-300 hover:bg-ink-2 disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Predict Price"}
        </button>

        {/* Error */}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Result */}
        {result && !loading && (
          <div className="mt-6 space-y-2 rounded-md border border-ink/10 bg-canvas-2/40 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-ink/50">Estimated Property Value</p>
            <p className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] text-ink">
              {formatInr(result.predicted_price_inr)}
            </p>
            <p className="text-sm text-ink/40">
              {result.predicted_price_lacs.toFixed(2)} Lacs
            </p>
            {result.confidence_range && (
              <p className="text-xs text-ink/50">
                Range: {formatInr(result.confidence_range.low_lacs * 100_000)} –{" "}
                {formatInr(result.confidence_range.high_lacs * 100_000)}
              </p>
            )}
            {result.deal_verdict && (
              <span
                className={`mt-2 inline-block rounded-sm px-3 py-1 text-sm font-semibold ${verdictColors[result.deal_verdict] ?? ""}`}
              >
                {verdictLabels[result.deal_verdict] ?? result.deal_verdict}
              </span>
            )}
            <p className="mt-3 text-[0.65rem] text-ink/30">
              Prediction generated by ML model • house_price_model.pkl
            </p>
          </div>
        )}

        {/* Map with nearby facilities */}
        {result && !loading && (
          <PredictMap lat={lat} lng={lng} address={addressText} />
        )}
      </div>
    </div>
  );
}
