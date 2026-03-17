"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPropertySearch } from "@/app/actions/properties";
import { geocodeAddress, extractCity, extractNeighborhood, extractZip } from "@/lib/geocode";
import { SimpleMap } from "@/components/map/simple-map";
import { EmailMatchForm } from "@/components/address-search/email-match-form";
import type { PropertySearchRow } from "@/lib/db/types";
import type { MatchWithBuyer } from "@/lib/db/queries";

type AgentOption = { id: string; display_name: string | null; email: string };

type Props = {
  initialProperty: PropertySearchRow | null;
  initialMatches: MatchWithBuyer[];
  agents?: AgentOption[];
};

export function AddressSearchContent({ initialProperty, initialMatches, agents }: Props) {
  const router = useRouter();
  const [address, setAddress] = useState(initialProperty?.raw_address ?? "");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geoResult, setGeoResult] = useState<{ lat: number; lng: number; city?: string | null; neighborhood?: string | null; zip?: string | null } | null>(
    initialProperty?.lat != null && initialProperty?.lng != null
      ? { lat: initialProperty.lat, lng: initialProperty.lng, city: initialProperty.city, neighborhood: initialProperty.neighborhood, zip: initialProperty.zip_code }
      : null
  );
  const property = initialProperty;
  const matches = initialMatches;

  async function handleGeocode() {
    if (!address.trim()) {
      toast.error("Enter an address");
      return;
    }
    setGeocoding(true);
    try {
      const result = await geocodeAddress(address);
      if (result) {
        setGeoResult({
          lat: result.lat,
          lng: result.lng,
          city: extractCity(result.address),
          neighborhood: extractNeighborhood(result.address),
          zip: extractZip(result.address),
        });
        toast.success("Address found");
      } else {
        toast.error("Could not geocode address");
      }
    } catch {
      toast.error("Geocoding failed");
    }
    setGeocoding(false);
  }

  async function handleSave() {
    if (!address.trim()) {
      toast.error("Enter an address");
      return;
    }
    setSaving(true);
    try {
      const result = await createPropertySearch({
        agent_id: agents?.length && selectedAgentId ? selectedAgentId : undefined,
        raw_address: address.trim(),
        city: geoResult?.city ?? null,
        neighborhood: geoResult?.neighborhood ?? null,
        zip_code: geoResult?.zip ?? null,
        lat: geoResult?.lat ?? null,
        lng: geoResult?.lng ?? null,
      });
      if (result.success && result.id) {
        toast.success("Property saved. Matches updated.");
        router.push(`/address-search?id=${result.id}`);
        router.refresh();
        return;
      }
      if (!result.success) toast.error(result.error ?? "Failed to save");
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  }

  const marker = geoResult ? ([geoResult.lat, geoResult.lng] as [number, number]) : null;
  const center = marker ?? ([34.0522, -118.2437] as [number, number]);

  return (
    <div className="flex flex-col gap-4">
      {agents && agents.length > 0 && (
        <div>
          <label htmlFor="address-agent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign to agent *</label>
          <select
            id="address-agent"
            required
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Select agent</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name || a.email} ({a.email})</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[200px] rounded-lg border border-slate-600 bg-white shadow dark:border-slate-500 dark:bg-slate-800">
          <input
            type="text"
            placeholder="Enter a property address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 bg-transparent py-3 pl-4 pr-2 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400"
            aria-label="Property address"
          />
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geocoding}
            className="flex items-center gap-2 rounded-r-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50 dark:bg-slate-600"
          >
            {geocoding && (
              <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            )}
            {geocoding ? "Searching…" : "Geocode"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {saving && (
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gray-900 border-t-transparent dark:border-gray-100 dark:border-t-transparent" aria-hidden />
          )}
          {saving ? "Saving…" : "Save property & match"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-slate-900">
          <SimpleMap center={center} zoom={marker ? 14 : 10} marker={marker} className="h-[300px]" />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Matching buyers</h2>
          {property ? (
            <>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {matches.length} buyer{matches.length !== 1 ? "s" : ""} match this property.
              </p>
              {matches.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {matches.map((m) => (
                    <li key={m.id} className="rounded border border-gray-100 dark:border-gray-800 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {(m.buyers as { buyer_name: string } | null)?.buyer_name ?? "—"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Score: {m.match_score ?? 0} — {(m.match_reasons as string[])?.join(", ") ?? ""}
                        </span>
                        <EmailMatchForm
                          propertyId={property.id}
                          buyerId={m.buyer_id}
                          recipientEmail={(m.buyers as { buyer_email: string | null } | null)?.buyer_email ?? ""}
                          buyerName={(m.buyers as { buyer_name: string } | null)?.buyer_name}
                          propertyAddress={property.raw_address}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No buyers match this property’s location yet.</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Save a property to see matching buyers.</p>
          )}
        </div>
      </div>
    </div>
  );
}
