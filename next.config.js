const { withPlaiceholder } = require("@plaiceholder/next");

/**
 * @type {import('next').NextConfig}
 */
module.exports = withPlaiceholder({
  experimental: {
    scrollRestoration: true,
    // https://github.com/shikijs/next-shiki
    serverComponentsExternalPackages: ["shiki", "vscode-oniguruma"],
  },
  transpilePackages: ["unified", "plaiceholder", "unist-util-visit"],
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/projects/winamp2-js{/}?",
        destination: "https://webamp.org",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      "jordaneldredge.com",
      // Avatars from GitHub comments
      "avatars.githubusercontent.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/projects/curl-proof/install/",
        destination: "/api/curl-proof",
      },
      {
        source: "/feed/:path*",
        destination: "/api/feed/:path*",
      },
    ];
  },
  trailingSlash: true,
  swcMinify: true,
  distDir: "build",
});

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error);
});
