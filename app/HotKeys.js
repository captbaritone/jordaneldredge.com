"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HotKeys() {
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" || (e.metaKey && e.key === "k")) {
        e.preventDefault();
        router.push("/search");
      }
    });
  }, [router]);
  return <></>;
}
