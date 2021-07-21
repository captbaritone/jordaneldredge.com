module.exports = {
  distDir: "nextjs/build",
  rewrites: [
    {
      source: "/projects/:match*",
      destination: "https://jordaneldredge.com/project/:match*",
    },
  ],
};
