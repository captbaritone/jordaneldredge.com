"use client";

import { useState } from "react";

const colors = ["light", "dark", "full", "deep", "low", "high"];
const adjectives = [
  "lyric",
  "coloratura",
  "spinto",
  "helden",
  "leggiero",
  "dramatic",
  "patter",
  "heroic",
  "character",
  "kavalier",
  "spiel",
  "comic",
];
const types = [
  "soubrette",
  "soprano",
  "alto",
  "mezzo",
  "mezzo-soprano",
  "bass",
  "tenor",
  "baritone",
  "countertenor",
  "sopranist",
  "castrato",
  "basso",
  "octavist",
  "haute-contre",
  "bass-baritone",
  "boy-soprano",
];
const descriptors = ["sfogato", "profundo", "cantabile", "cantate"];
const extensions = ["with an upper extension", "with a lower extension"];

const prompts = [
  "My teacher says I'm a:",
  "My coach says I'm a:",
  "I'm really a:",
  "I tend to think of myself as a:",
  "Everyone says I sound like a:",
  "My voice has the colors of a:",
];

const excuses = [
  "You wish",
  "Seriously?",
  "In what house?",
  "Nobody would hire you for that",
  "Is that even a fach?",
];

// Deterministic PRNG using Mulberry32
function seededRandom(seed: number): () => number {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randomIfRoll<T>(
  arr: T[],
  probability: number,
  rand: () => number,
  joiner = " ",
): string {
  return rand() < probability
    ? joiner + arr[Math.floor(rand() * arr.length)]
    : "";
}

function generateFach(seed: number) {
  const rand = seededRandom(seed);
  let result = "";
  result += randomIfRoll(colors, 1, rand);
  result += randomIfRoll(adjectives, 1, rand);
  result += randomIfRoll(types, 1, rand);
  result += randomIfRoll(descriptors, 0.45, rand, "-");
  result += randomIfRoll(extensions, 0.45, rand);
  return capitalize(result.trim());
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function FachPage({ baseSeed }: { baseSeed: number }) {
  const fachSeed = baseSeed;
  const promptSeed = baseSeed + 1;
  const excuseSeed = baseSeed + 2;
  const [fach, setFach] = useState(() => generateFach(fachSeed));
  const [prompt, setPrompt] = useState(() => {
    const rand = seededRandom(promptSeed);
    return prompts[Math.floor(rand() * prompts.length)];
  });
  const [excuse, setExcuse] = useState(() => {
    const rand = seededRandom(excuseSeed);
    return excuses[Math.floor(rand() * excuses.length)];
  });

  function handleClick() {
    const newSeed = Date.now();
    setFach(generateFach(newSeed));
    const promptRand = seededRandom(newSeed + 1);
    setPrompt(prompts[Math.floor(promptRand() * prompts.length)]);
    const excuseRand = seededRandom(newSeed + 2);
    setExcuse(excuses[Math.floor(excuseRand() * excuses.length)]);
  }

  return (
    <div className="text-center px-4 py-12 h-screen flex flex-col justify-between items-center">
      <div
        className="flex-grow justify-center flex flex-col text-center cursor-pointer select-none"
        onClick={handleClick}
      >
        <h2 className="text-lg mb-6">{prompt}</h2>
        <h1 className="text-5xl md:text-6xl font-bold mb-12">{fach}</h1>
        <h2>
          <span className="text-blue-600 underline text-lg">{excuse}</span>
        </h2>
      </div>
      <footer className="mt-32 text-center text-sm mb-4 shrink-0">
        For real help finding roles, see my other site{" "}
        <a href="http://fachme.com" className="underline">
          FachMe.com
        </a>
        <br />
        &copy;2013
        {new Date().getFullYear() !== 2013
          ? `-${new Date().getFullYear().toString().slice(-2)}`
          : ""}{" "}
        <a href="http://jordaneldredge.com" className="underline">
          Jordan Eldredge
        </a>{" "}
      </footer>
    </div>
  );
}
