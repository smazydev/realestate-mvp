import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function AdminAgentEditRedirect({ params }: Props) {
  await params;
  redirect("/admin/agents");
}
