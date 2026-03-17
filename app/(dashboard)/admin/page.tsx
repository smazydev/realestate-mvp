import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb segments={[{ label: "Admin" }]} />
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Identity and access: manage <strong>Profiles</strong> (users and roles) and <strong>Agents</strong> (link users to agent records). 
        Content—buyers, seller leads, and properties—is managed on their own pages; as admin you can assign which agent owns each.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Identity & access</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/admin/profiles" className="underline">Profiles</Link> — Users and roles (edit role, name, email)</li>
            <li><Link href="/admin/agents" className="underline">Agents</Link> — Create and edit agents (link to user)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Content (admin can assign agent)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/buyers" className="underline">Buyers</Link> — Add and edit buyers</li>
            <li><Link href="/seller-leads" className="underline">Seller Leads</Link> — Add and edit seller leads</li>
            <li><Link href="/address-search" className="underline">Address Search</Link> — Save properties and run matching</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
