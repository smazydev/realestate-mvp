import { Breadcrumb } from "@/components/layout/breadcrumb";
import { mockBuyerCards, formatCurrency } from "@/lib/mock-data";
export default function BuyersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Breadcrumb segments={[{ label: "Buyer Management", href: "/buyers" }, { label: "Buyer Management" }]} />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add and view buyers using the prominent &quot;Add Buyer&quot; button and minimal, more...</p>
        </div>
        <button type="button" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">Add Buyer</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" aria-label="Target Neighborhoods">
          <option>Target Neighborhoods</option>
        </select>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Filter</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Sort</button>
        <button type="button" className="ml-auto rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="Search">Q</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {mockBuyerCards.map((card) => (
          <article key={card.id} className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-md dark:border-gray-800 dark:bg-gray-950">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Buyer Name</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-gray-100">{card.buyerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Target Cities</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {card.targetCities.map((city) => (
                  <span key={city} className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-600 dark:text-slate-200">{city}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Budget Max</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(card.budgetMax)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{card.notes || "—"}</p>
            </div>
            <div className="mt-auto">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Agent Email (lookup)</p>
              <p className="mt-0.5 truncate text-sm text-gray-900 dark:text-gray-100">{card.agentEmail}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
