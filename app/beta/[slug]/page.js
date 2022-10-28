import RootPage from "../RootPage";

export default function Page({ params, searchParams }) {
  return <RootPage slug={params.slug} />;
}
