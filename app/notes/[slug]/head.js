import MyHead from "../../MyHead";
import { getTilPage } from "../notion";

export default async function Head({ params }) {
  const page = await getTilPage(params.slug);
  return <MyHead title={`${page.title}`} />;
}
