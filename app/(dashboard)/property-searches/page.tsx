import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getPropertySearches } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/mock-data";

export default async function PropertySearchesPage() {
  const list = await getPropertySearches();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb segments={[{ label: "Property Searches", href: "/property-searches" }, { label: "Saved searches" }]} />
      <p className="text-sm text-gray-500 dark:text-gray-400">Saved property searches. Open one to view matching buyers and send emails.</p>
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">No saved property searches yet.</p>
          <Link href="/address-search" className="mt-2 inline-block text-sm font-medium text-gray-900 underline dark:text-gray-200">Search & save a property</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#2a2a2a]">
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Address</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">City</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Neighborhood</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">ZIP</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Price</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Saved</th>
                <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 dark:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{row.raw_address}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.city ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.neighborhood ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.zip_code ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                    {row.price != null ? formatCurrency(Number(row.price)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/address-search?id=${row.id}`}
                      className="text-sm font-medium text-gray-900 underline hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-300"
                    >
                      View matches
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} saved search{list.length !== 1 ? "es" : ""}</p>
    </div>
  );
}
