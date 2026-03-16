import { Breadcrumb } from "@/components/layout/breadcrumb";
import { mockSellerLeads } from "@/lib/mock-data";
export default function SellerLeadsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb segments={[{ label: "Seller Leads", href: "/seller-leads" }, { label: "Seller Leads List" }]} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">Status</button>
        <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">Tags</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Group</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Filter</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Sort</button>
        <button type="button" className="ml-auto rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="Search">Q</button>
        <button type="button" className="rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="More">⋯</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Property Address</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Owner Name</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Assigned To</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Tags</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">City</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">State</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">ZIP</th>
              <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Source</th>
            </tr>
          </thead>
          <tbody>
            {mockSellerLeads.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                <td className="px-4 py-3">
                  {row.statusBadge && <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">{row.statusBadge}</span>}
                  <span className="text-gray-900 dark:text-gray-200">{row.propertyAddress}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.ownerName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.assignedTo}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.tags.length === 0 && <span className="text-gray-400">-</span>}
                    {row.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-2 py-0.5 text-xs ${tag === "Expired Listing" ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" : tag === "Other" ? "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.city}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.state}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.zip}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{mockSellerLeads.length} records</p>
    </div>
  );
}
