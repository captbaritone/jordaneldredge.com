module.exports = {
  distDir: "build",
  rewrites: [
    {
      source: "/projects/:match*",
      destination: "https://jordaneldredge.com/project/:match*",
    },
  ],
};
