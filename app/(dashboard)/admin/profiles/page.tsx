import { listProfiles } from "@/app/actions/profiles";
import { AdminProfilesPageClient } from "@/components/admin/profiles-page-client";

export default async function AdminProfilesPage() {
  const profiles = await listProfiles();
  return <AdminProfilesPageClient profiles={profiles} />;
}
