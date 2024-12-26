// app/Dropdown.js
"use client"; // This makes it a Client Component
import { useRouter } from "next/navigation";

export default function SortSelect({ currentParam }) {
  const router = useRouter();

  const handleChange = (event) => {
    const value = event.target.value;

    // Update the search parameter
    const params = new URLSearchParams(window.location.search);
    params.set("sort", value);

    // Push the updated URL
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={currentParam} onChange={handleChange}>
      <option value="best">Best</option>
      <option value="latest">Latest</option>
    </select>
  );
}
