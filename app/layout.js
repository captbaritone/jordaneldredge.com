import "../styles/globals.css";
import "../styles/shiki-twoslash.css";

import Script from "next/script";
import AudioPlayer from "./AudioPlayer";
import AudioContextProvider from "./AudioContext";

export const metadata = {
  metadataBase: new URL("https://jordaneldredge.com"),
  title: {
    template: "%s / Jordan Eldredge",
  },
};

export default async function Layout({ children }) {
  return (
    <html>
      <body>
        <AudioContextProvider>
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
              
              ga('create', 'UA-96948-15', 'auto');
              ga('send', 'pageview')
        `}
          </Script>
          {children}
          <AudioPlayer />
        </AudioContextProvider>
      </body>
    </html>
  );
}
