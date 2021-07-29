/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  distDir: "build",
  async rewrites() {
    return [
      {
        source: "/projects/:match*{/}?",
        destination: "https://jordaneldredge.com/projects/:match*/",
      },
      {
        source: "/ukulele-chords{/}?",
        destination: "https://jordaneldredge.com/ukulele-chords/",
      },
    ];
  },
  trailingSlash: true,
};
