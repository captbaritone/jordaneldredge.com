import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Inconsolata } from "next/font/google";

// import Script from "next/script";
import AudioPlayer from "./AudioPlayer";
import AudioContextProvider from "./AudioContext";
import { Metadata, Viewport } from "next";

// No weight list, so we get the variable font: every weight in one file. The
// optical size axis tightens large headings and opens up small text.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-inter",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inconsolata",
});

const fontVariables = [
  inter.variable,
  inconsolata.variable,
].join(" ");

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
    openGraph: { siteName: "Jordan Eldredge", title, images },
    twitter: {
      creator: "@captbaritone",
      card: "summary_large_image",
      title,
      images,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function Layout({ children }) {
  return (
    <html className={fontVariables}>
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
