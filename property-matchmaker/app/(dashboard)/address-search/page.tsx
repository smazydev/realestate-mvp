import { Breadcrumb } from "@/components/layout/breadcrumb";
export default function AddressSearchPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
        <Breadcrumb segments={[{ label: "Address Search", href: "/address-search" }, { label: "LA Property Map" }]} />
        <div className="flex items-center gap-2">
          <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Filter</button>
          <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Sort</button>
          <button type="button" className="rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="Search">Q</button>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-lg bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute left-1/2 top-8 z-10 w-full max-w-xl -translate-x-1/2 px-4">
          <div className="flex rounded-lg border border-slate-600 bg-white shadow-lg dark:border-slate-500 dark:bg-slate-800">
            <span className="flex items-center pl-4 text-slate-400">Q</span>
            <input type="text" placeholder="Enter a property address..." className="flex-1 bg-transparent py-3 pl-2 pr-2 text-gray-900 placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400" aria-label="Property address" />
            <button type="button" className="rounded-r-lg bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 dark:bg-slate-600">Search</button>
          </div>
        </div>
        <div className="absolute right-4 top-24 z-10 flex flex-col gap-1 rounded-lg border border-slate-600/50 bg-slate-800/90 p-1">
          <button type="button" className="rounded p-2 text-slate-300 hover:bg-slate-700" aria-label="Zoom in">+</button>
          <button type="button" className="rounded p-2 text-slate-300 hover:bg-slate-700" aria-label="Zoom out">−</button>
          <button type="button" className="rounded p-2 text-slate-300 hover:bg-slate-700" aria-label="Reset view">⌃</button>
        </div>
        <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-slate-600/50 bg-slate-800/90 px-3 py-2 text-xs text-slate-300">
          <p className="mb-1.5 font-medium text-slate-200">Legend</p>
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> Match</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /> No match</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-500" /> Search ✓</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500" /> Search ✕</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 z-10 text-xs text-slate-500">© Mapbox © OpenStreetMap</div>
      </div>
    </div>
  );
}
