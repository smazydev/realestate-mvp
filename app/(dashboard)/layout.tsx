import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const admin = await isAdmin();

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? undefined} userName={user.user_metadata?.full_name ?? user.email ?? undefined} isAdmin={admin} />
      <div className="flex flex-1 flex-col bg-white dark:bg-[#1a1a1a]">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
