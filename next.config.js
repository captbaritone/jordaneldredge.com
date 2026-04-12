/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    scrollRestoration: true,
    viewTransition: true,
  },
  // // https://github.com/shikijs/next-shiki
  serverExternalPackages: ["shiki", "vscode-oniguruma"],
  transpilePackages: ["unified", "unist-util-visit"],
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/about{/}?",
        destination: "/",
        permanent: true,
      },
      {
        source: "/projects/winamp2-js{/}?",
        destination: "https://webamp.org",
        permanent: true,
      },
      // We used to store blog posts and notes under /blog/ and /notes/
      // We now redirect those old URLs to the new location at the root
      {
        source: "/blog/:slug/",
        destination: "/:slug/",
        permanent: true,
      },
      {
        source: "/notes/:slug/",
        destination: "/:slug/",
        permanent: true,
      },
      {
        source: "/blog/:slug(.+\\.md)",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/blog/:slug(.+\\.mp3)",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/notes/:slug(.+\\.md)",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/notes/:slug(.+\\.mp3)",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "pub-d4cecb3d578a4c0a8939680792e49682.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "markdown.today",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "jordaneldredge.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
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

      {
        source: "/:slug(.+\\.md)",
        destination: "/:slug/md",
      },
      {
        source: "/:slug(.+\\.mp3)",
        destination: "/:slug/mp3",
      },
    ];
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md"],
  trailingSlash: true,
  distDir: "build",
};

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error);
});
