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
    <select
      value={currentParam}
      onChange={handleChange}
      style={{
        background: "white",
        display: "inline",
        border: "1px solid lightgrey",
        height: "2rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        marginLeft: "0.5rem",
        borderRadius: "0.5rem",
        // https://stackoverflow.com/a/6394497
        fontSize: "16px",
      }}
    >
      <option
        value="best"
        style={{
          appearance: "none",
          background: "white",
        }}
      >
        Best
      </option>
      <option
        value="latest"
        style={{
          appearance: "none",
          background: "white",
        }}
      >
        Latest
      </option>
    </select>
  );
}
