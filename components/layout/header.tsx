"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getBuyerFilterOptions } from "@/app/actions/buyers";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterOptions, setFilterOptions] = useState<{ cities: string[]; neighborhoods: string[] }>({ cities: [], neighborhoods: [] });
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  const isBuyers = pathname === "/buyers" || pathname.startsWith("/buyers");
  const city = searchParams.get("city") ?? "";
  const neighborhood = searchParams.get("neighborhood") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const q = searchParams.get("q") ?? "";

  // Sync search input with URL
  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  // Load filter options when on buyers page
  useEffect(() => {
    if (isBuyers) {
      getBuyerFilterOptions().then(setFilterOptions);
    }
  }, [isBuyers]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !filterRef.current?.contains(target) &&
        !sortRef.current?.contains(target) &&
        !moreRef.current?.contains(target)
      ) {
        setFilterOpen(false);
        setSortOpen(false);
        setMoreOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function updateParams(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const path = pathname + (next.toString() ? `?${next.toString()}` : "");
    router.push(path);
  }

  const activeFiltersCount = [city, neighborhood].filter(Boolean).length;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-[#2a2a2a]">
      <div />
      <div className="flex items-center gap-3">
        {isBuyers && (
          <>
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); setMoreOpen(false); }}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-[#2a2a2a]">
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">City</div>
                  <select
                    value={city}
                    onChange={(e) => { updateParams({ city: e.target.value }); }}
                    className="mx-2 w-[calc(100%-1rem)] rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="">All cities</option>
                    {filterOptions.cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Neighborhood</div>
                  <select
                    value={neighborhood}
                    onChange={(e) => { updateParams({ neighborhood: e.target.value }); }}
                    className="mx-2 w-[calc(100%-1rem)] rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="">All neighborhoods</option>
                    {filterOptions.neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => { updateParams({ city: "", neighborhood: "" }); setFilterOpen(false); }}
                      className="mt-2 ml-2 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); setMoreOpen(false); }}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Sort {sort ? `(${activeSortLabel})` : ""}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#2a2a2a]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || "default"}
                      type="button"
                      onClick={() => { updateParams({ sort: opt.value }); setSortOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {sort && (
              <span className="text-xs text-gray-400 dark:text-gray-500">=1</span>
            )}

            <div className="flex items-center gap-1 rounded border border-gray-200 dark:border-gray-600">
              <span className="pl-2 text-gray-400" aria-hidden>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search buyers..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateParams({ q: searchValue.trim() })}
                onBlur={() => updateParams({ q: searchValue.trim() })}
                className="w-36 border-0 bg-transparent py-1.5 pr-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder-gray-500"
                aria-label="Search buyers"
              />
            </div>
          </>
        )}

        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => { setMoreOpen(!moreOpen); setFilterOpen(false); setSortOpen(false); }}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="More options"
          >
            ⋯
          </button>
          {moreOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#2a2a2a]">
              <button
                type="button"
                onClick={() => { router.refresh(); setMoreOpen(false); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
