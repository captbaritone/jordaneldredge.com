"use client";
import { useRef, useState, useEffect, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import {
  clearSearchTransition,
  SEARCH_RESULT_ATTRIBUTE,
  useSearchTransition,
} from "./searchTransition";
/** A generic list component that supports keyboard navigation and selection */

// How many of the new results to animate, from the top. Together with the
// results that were on screen when the search started, that covers everything
// visible. Animating every result (up to all ~300 posts) makes the browser
// capture each one, and the animation stutters.
const ANIMATED_NEW_RESULTS = 12;

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
  const search = useSearchTransition();

  // New results have committed, and with them the view transition that
  // animates them, so later updates (like navigating away) stay still.
  useEffect(() => {
    clearSearchTransition();
  }, [items]);

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
      {items.map((item, index) => {
        // Only search updates animate the list: results that stay slide to
        // their new position, new ones rise in, and removed ones fade out.
        const animate =
          search.pending &&
          (index < ANIMATED_NEW_RESULTS || search.visibleKeys.has(item.key));
        return (
          <ViewTransition
            key={item.key}
            default="none"
            update={animate ? "search-move" : "none"}
            enter={animate ? "search-enter" : "none"}
            exit={search.visibleKeys.has(item.key) ? "search-exit" : "none"}
          >
            <li
              {...{ [SEARCH_RESULT_ATTRIBUTE]: item.key }}
              className={index === selectedIndex ? selectedStyle : ""}
            >
              {item.component}
            </li>
          </ViewTransition>
        );
      })}
    </ul>
  );
}
