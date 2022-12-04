import MyHead from "../../MyHead";
import { getNotePage } from "../notion";

export default async function Head({ params }) {
  // TODO: Figure out how to read search params in head.js
  const page = await getNotePage(params.slug);

  return <MyHead title={`${page.title}`} />;
}
