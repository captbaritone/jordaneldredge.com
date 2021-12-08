import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

loadLanguages([
  "php",
  "json",
  "jsx",
  "vim",
  "bash",
  "python",
  "markdown",
  "yml",
]);

Prism.languages["plainText"] = {};

export default Prism;
