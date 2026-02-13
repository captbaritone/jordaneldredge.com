import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

import { GoogleAnalytics } from "@next/third-parties/google";

// import Script from "next/script";
import AudioPlayer from "./AudioPlayer";
import AudioContextProvider from "./AudioContext";
import { Metadata } from "next";

export function generateMetadata(): Metadata {
  const title = {
    template: "%s / Jordan Eldredge",
    default: "Jordan Eldredge",
  };
  const images = [
    {
      url: "https://jordaneldredge.com/images/avatar.jpg",
      width: 612,
      height: 612,
      alt: "Jordan Eldredge",
    },
  ];
  return {
    metadataBase: new URL("https://jordaneldredge.com"),
    title,
    description:
      "The personal website of Jordan Eldredge, a software engineer and musician.",
    viewport: "width=device-width, initial-scale=1",
    openGraph: { siteName: "Jordan Eldredge", title, images },
    twitter: {
      creator: "@captbaritone",
      card: "summary_large_image",
      title,
      images,
    },
  };
}

export default async function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <AudioContextProvider>
          {children}
          <AudioPlayer />
        </AudioContextProvider>
      </body>
      <GoogleAnalytics gaId="UA-96948-15" />
    </html>
  );
}
