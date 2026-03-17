import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProfileEditRedirect({ params }: Props) {
  await params;
  redirect("/admin/profiles");
}
