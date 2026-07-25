import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import {
  Alegreya,
  Alegreya_Sans,
  IBM_Plex_Sans,
  Inconsolata,
} from "next/font/google";

// import Script from "next/script";
import AudioPlayer from "./AudioPlayer";
import AudioContextProvider from "./AudioContext";
import { Metadata, Viewport } from "next";

const alegreya = Alegreya({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-alegreya",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-plex-sans",
});

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-alegreya-sans",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inconsolata",
});

const fontVariables = [
  alegreya.variable,
  alegreyaSans.variable,
  plexSans.variable,
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
