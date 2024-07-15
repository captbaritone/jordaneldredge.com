import { Suspense } from "react";
import PageImpl from "./pageImpl";

export async function generateMetadata({ searchParams }) {
  const title = searchParams.q ? `Search: "${searchParams.q}"` : "Search";
  return { title };
}

export default function Search() {
  return (
    <Suspense fallback={null}>
      <PageImpl />
    </Suspense>
  );
}
