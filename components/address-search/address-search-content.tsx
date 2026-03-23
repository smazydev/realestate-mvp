"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mapboxGeocode } from "@/lib/mapbox-geocode";
import { getBuyersMatchingCity } from "@/app/actions/buyers";
import type { BuyerCityMatch } from "@/app/actions/buyers";
import { createPropertySearch } from "@/app/actions/properties";
import { MapboxMap } from "@/components/map/mapbox-map";
import { EmailMatchForm } from "@/components/address-search/email-match-form";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  agents?: AgentOption[];
};

export function AddressSearchContent({ agents }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [geoResult, setGeoResult] = useState<{ lat: number; lng: number; place_name: string; city: string | null } | null>(null);
  const [matchingBuyers, setMatchingBuyers] = useState<BuyerCityMatch[]>([]);
  /** Shared property_searches row for this map result (created on first send-email). */
  const [propertySearchId, setPropertySearchId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Enter an address or city");
      return;
    }
    setSearching(true);
    setGeoResult(null);
    setMatchingBuyers([]);
    setPropertySearchId(null);
    try {
      const result = await mapboxGeocode(trimmed);
      if (!result) {
        toast.error("Could not find that location");
        setSearching(false);
        return;
      }
      setGeoResult(result);
      const matchLabel =
        result.city?.trim() ||
        result.place_name.split(",")[0]?.trim() ||
        result.place_name;
      const buyers = await getBuyersMatchingCity(matchLabel);
      setMatchingBuyers(buyers);
    } catch {
      toast.error("Search failed");
    }
    setSearching(false);
  }

  function handleClear() {
    setQuery("");
    setGeoResult(null);
    setMatchingBuyers([]);
    setPropertySearchId(null);
  }

  /** Ensures a property_searches row exists for the current pin (for Resend logs + matching). */
  async function ensurePropertyIdForEmail(): Promise<string | null> {
    if (propertySearchId) return propertySearchId;
    if (!geoResult) return null;
    const rawAddress = query.trim() || geoResult.place_name;
    try {
      const result = await createPropertySearch({
        agent_id: agents?.length && selectedAgentId ? selectedAgentId : undefined,
        raw_address: rawAddress,
        city: geoResult.city ?? null,
        neighborhood: null,
        zip_code: null,
        lat: geoResult.lat,
        lng: geoResult.lng,
      });
      if (result.success && result.id) {
        setPropertySearchId(result.id);
        router.refresh();
        return result.id;
      }
      toast.error(!result.success ? result.error : "Failed to save property");
      return null;
    } catch {
      toast.error("Failed to save property");
      return null;
    }
  }

  const marker = geoResult ? ([geoResult.lat, geoResult.lng] as [number, number]) : null;
  const center = marker ?? ([34.0522, -118.2437] as [number, number]);

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Map - full area */}
      <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
        <MapboxMap center={center} zoom={marker ? 14 : 10} marker={marker} className="absolute inset-0 h-full w-full" />
      </div>

      {/* Search bar overlay - top center (Airtable style) */}
      <div className="relative z-10 mx-auto mt-4 w-full max-w-xl px-4">
        <div className="flex rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-900">
          <span className="flex items-center pl-4 text-gray-400" aria-hidden>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search address or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="min-w-0 flex-1 bg-transparent py-3 px-3 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400"
            aria-label="Search address or city"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-1.5 rounded-r-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50 dark:bg-slate-600"
          >
            {searching && (
              <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            )}
            {searching ? "Searching…" : "Search"}
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-r-lg px-3 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Clear"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          )}
        </div>

        {/* Dropdown / message below search (like Airtable) */}
        {geoResult && (
          <div className="mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{geoResult.place_name}</p>
            {searching ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-400 border-t-transparent dark:border-gray-500"
                  aria-hidden
                />
                <span>Checking buyers for this area…</span>
              </p>
            ) : matchingBuyers.length === 0 ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No buyers currently targeting this city.</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {matchingBuyers.length} buyer{matchingBuyers.length !== 1 ? "s" : ""} targeting this city.
                </p>
                <ul className="mt-3 space-y-2">
                  {matchingBuyers.map((buyer) => (
                    <li key={buyer.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-100 p-2 dark:border-gray-800">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{buyer.buyer_name}</span>
                      <EmailMatchForm
                        buyerId={buyer.id}
                        buyerName={buyer.recipient_name ?? buyer.buyer_name}
                        recipientEmail={buyer.recipient_email ?? ""}
                        propertyAddress={query.trim() || geoResult.place_name}
                        ensurePropertyId={ensurePropertyIdForEmail}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Admin: assign agent (optional, bottom or collapsible) */}
      {agents && agents.length > 0 && (
        <div className="relative z-10 mt-auto p-4">
          <label htmlFor="address-agent" className="sr-only">Assign to agent</label>
          <select
            id="address-agent"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Assign to agent (optional)</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name || a.email}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
