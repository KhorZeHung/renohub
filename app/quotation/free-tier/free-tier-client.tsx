"use client";

import dynamic from "next/dynamic";
import FreeTierLoading from "./loading";

// ssr: false must live in a Client Component
export const FreeTierFormDynamic = dynamic(
  () =>
    import("@/components/quotations/free-tier-form").then(
      (m) => m.FreeTierForm
    ),
  { ssr: false, loading: FreeTierLoading }
);
