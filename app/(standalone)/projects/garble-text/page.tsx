"use client";

import { useState } from "react";

function garbleText(text: string): string {
  return text.replace(/(?<=[a-zA-Z])([a-zA-Z]+)(?=[a-zA-Z])/g, (match) =>
    match
      .split("")
      .sort(() => 0.5 - Math.random())
      .join(""),
  );
}

export default function GarblePage() {
  const [input, setInput] = useState("Try typing a sentence.");
  const [output, setOutput] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOutput(garbleText(input));
  }

  return (
    <div className="p-8 max-w-xl mx-auto font-sans">
      <h1 className="text-xl font-bold mb-4">
        Only the first and last letters must be in the right place
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          name="text"
          rows={8}
          className="w-full border p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Scramble!
        </button>
      </form>
      {output && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Garbled:</h2>
          <div className="whitespace-pre-wrap border p-4 bg-gray-100">
            {output}
          </div>
        </div>
      )}
      <div className="mt-6 text-sm text-gray-600">
        <a
          href="https://github.com/captbaritone/jordaneldredge.com/blob/4015a4fb52ec3d2bbef6c542180ee5e800d87a86/app/(standalone)/projects/garble-text/page.tsx"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Source code
        </a>
      </div>
    </div>
  );
}
