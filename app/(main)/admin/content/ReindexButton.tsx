"use client";

import { reindex } from "../../../../lib/data/Indexable";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ReindexButton() {
  const [status, setStatus] = useState<Status>("idle");

  const buttonText = {
    idle: "Reindex",
    loading: "Reindexing...",
    success: "Done ✓",
    error: "Failed ✗",
  }[status];

  const buttonClass = {
    idle: "bg-blue-600 hover:bg-blue-700",
    loading: "bg-blue-600 opacity-50 cursor-not-allowed",
    success: "bg-green-600",
    error: "bg-red-600",
  }[status];

  return (
    <button
      disabled={status === "loading"}
      className={`px-3 py-1 text-sm text-white rounded ${buttonClass}`}
      onClick={async () => {
        setStatus("loading");
        try {
          await reindex({ force: false, filter: null });
          setStatus("success");
          setTimeout(() => setStatus("idle"), 2000);
        } catch {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        }
      }}
    >
      {buttonText}
    </button>
  );
}
