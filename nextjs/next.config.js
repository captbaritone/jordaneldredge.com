/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  distDir: "build",
  async rewrites() {
    return [
      {
        source: "/projects/:match*",
        destination: "https://jordaneldredge.com/project/:match*",
      },
    ];
  },
};
