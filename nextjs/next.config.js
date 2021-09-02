const withTM = require("next-transpile-modules")(["unified", "plaiceholder"]);
const { withPlaiceholder } = require("@plaiceholder/next");

/**
 * @type {import('next').NextConfig}
 */
module.exports = withPlaiceholder(
  withTM({
    distDir: "build",
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
    trailingSlash: true,
  })
);
