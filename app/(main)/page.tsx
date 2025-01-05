import RootPage from "../RootPage";

export const metadata = {
  title: "About / Jordan Eldredge",
  description: "About Jordan Eldredge",
  openGraph: {
    siteName: "Jordan Eldredge",
    locale: "en_US",
    title: "About / Jordan Eldredge",
  },
  twitter: {
    creator: "@captbaritone",
    title: "About / Jordan Eldredge",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed/rss.xml",
    },
  },
};

export default async function Page() {
  return <RootPage slug="about" />;
}
