"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function PricingFlashMessages() {
  const searchParams = useSearchParams();
  const canceledShown = useRef(false);

  useEffect(() => {
    if (searchParams.get("stripe_cancel") !== "1") return;

    if (canceledShown.current) return;

    canceledShown.current = true;
    toast.message("Checkout canceled", {
      description: "No charges were made. You can subscribe again anytime from this page.",
      id: "stripe-checkout-canceled",
    });
  }, [searchParams]);

  return null;
}
