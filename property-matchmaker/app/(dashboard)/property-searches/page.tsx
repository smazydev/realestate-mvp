import { Breadcrumb } from "@/components/layout/breadcrumb";
import { mockPropertySearchRows, formatCurrency } from "@/lib/mock-data";
export default function PropertySearchesPage() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb segments={[{ label: "Property Searches", href: "/property-searches" }, { label: "Buyers" }]} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Group</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Filter</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Sort</button>
        <button type="button" className="ml-auto rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="Search">Q</button>
        <button type="button" className="rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="More">⋯</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Buyer Name</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Target Cities</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Target Neighborhoods</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Budget Max</th>
            </tr>
          </thead>
          <tbody>
            {mockPropertySearchRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{row.buyerName}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.targetCities.map((city) => (
                      <span key={city} className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-[#8B5E3C] dark:text-white">{city}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {row.targetNeighborhoods.map((n) => (
                      <span key={n} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-[#4C5C6B] dark:text-white">{n}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">{formatCurrency(row.budgetMax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{mockPropertySearchRows.length} records</p>
    </div>
  );
}
