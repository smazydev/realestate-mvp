import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
export default function HomePage() {
  return (
    <div className="space-y-4">
      <Breadcrumb segments={[{ label: "Home" }]} />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Property Matchmaker</h1>
      <p className="text-gray-600 dark:text-gray-400">Manage buyers, search addresses, and match properties.</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
        <li><Link href="/property-searches" className="underline">Property Searches</Link> — View buyer criteria</li>
        <li><Link href="/buyers" className="underline">Buyer Management</Link> — Manage buyers</li>
        <li><Link href="/address-search" className="underline">Address Search</Link> — Search and match</li>
        <li><Link href="/seller-leads" className="underline">Seller Leads</Link> — Manage leads</li>
      </ul>
    </div>
  );
}
