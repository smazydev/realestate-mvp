import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditBuyerPage({ params }: Props) {
  await params;
  redirect("/buyers");
}
