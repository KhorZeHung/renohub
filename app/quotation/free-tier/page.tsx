import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { FreeTierFormDynamic } from "./free-tier-client";

export const metadata: Metadata = {
  title: "Free Quotation Generator | RenoHub",
  description:
    "Generate a professional renovation quotation PDF for free — no sign-up required.",
};

export default async function FreeTierPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <FreeTierFormDynamic />;
}
