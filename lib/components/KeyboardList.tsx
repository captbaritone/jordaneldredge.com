"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
/** A generic list component that supports keyboard navigation and selection */

type Props = {
  children: {
    key: string;
    url: string;
    component: React.ReactNode;
  }[];
  onSelect?: (key: string) => void;
};

export default function KeyboardList({ children: items, onSelect }: Props) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        const selectedItem = items[selectedIndex];
        if (selectedItem) {
          router.push(selectedItem.url);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [items, selectedIndex, onSelect, router]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selectedIndex]);

  const selectedStyle = "bg-gray-100 -mx-2 px-2 rounded-md";

  return (
    <ul ref={listRef}>
      {items.map((item, index) => (
        <li
          key={item.key}
          data-key={item.key}
          className={index === selectedIndex ? selectedStyle : ""}
        >
          {item.component}
        </li>
      ))}
    </ul>
  );
}
