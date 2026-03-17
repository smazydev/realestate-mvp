"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = { cities: string[]; neighborhoods: string[] };

export function BuyerFilters({ cities, neighborhoods }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const city = searchParams.get("city") ?? "";
  const neighborhood = searchParams.get("neighborhood") ?? "";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/buyers?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by city"
        value={city}
        onChange={(e) => updateFilter("city", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        aria-label="Filter by neighborhood"
        value={neighborhood}
        onChange={(e) => updateFilter("neighborhood", e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        <option value="">All neighborhoods</option>
        {neighborhoods.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {(city || neighborhood) && (
        <button
          type="button"
          onClick={() => router.push("/buyers")}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
