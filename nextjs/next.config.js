const withTM = require("next-transpile-modules")(["unified"]);
/**
 * @type {import('next').NextConfig}
 */
module.exports = withTM({
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
  trailingSlash: true,
});
