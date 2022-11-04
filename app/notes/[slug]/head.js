import MyHead from "../../MyHead";
import { getNotePage, TEN_MINUTES_IN_MS } from "../notion";

export default async function Head({ params }) {
  // TODO: Figure out how to read search params in head.js
  const page = await getNotePage(TEN_MINUTES_IN_MS)(params.slug);

  return <MyHead title={`${page.title}`} />;
}
