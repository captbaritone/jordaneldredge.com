"use client";

import { useState } from "react";
import { approve } from "./approve";

export function ApproveButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleApprove() {
    setStatus("loading");
    try {
      const result = await approve(code);
      setStatus("done");
      setMessage(
        `Authorized! You can close this page and return to the CLI.`,
      );
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Something went wrong");
    }
  }

  if (status === "done") {
    return <p>{message}</p>;
  }

  return (
    <div>
      <button
        onClick={handleApprove}
        disabled={status === "loading"}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "loading" ? "Authorizing..." : "Authorize CLI"}
      </button>
      {status === "error" && <p className="text-red-600 mt-2">{message}</p>}
    </div>
  );
}
