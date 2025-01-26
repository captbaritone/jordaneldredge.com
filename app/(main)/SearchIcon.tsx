"use client";
import { FaSearch } from "react-icons/fa";
import { useSearchKeyboardEvents } from "../useSearchKeyboardEvents";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SEARCH_URL = "/search";

export default function SearchIcon() {
  const router = useRouter();
  useSearchKeyboardEvents({
    onOpen() {
      router.push(SEARCH_URL);
    },
  });
  return (
    <Link href={SEARCH_URL}>
      <FaSearch title="Search" />
    </Link>
  );
}
