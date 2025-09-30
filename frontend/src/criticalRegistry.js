import appSrc from "./App.jsx?raw";
import footerBar from "./components/FooterBar.jsx?raw";
import composer from "./lib/copyComposer.js?raw";
import readme from "../../README.md?raw";
import renderYaml from "../../render.yaml?raw";
import stpMake from "../../tools/stp_make.py?raw";

export const criticalFiles = [
  { path: "frontend/src/App.jsx", bytes: appSrc.length, inline: true, content: appSrc },
  { path: "frontend/src/components/FooterBar.jsx", bytes: footerBar.length, inline: true, content: footerBar },
  { path: "frontend/src/lib/copyComposer.js", bytes: composer.length, inline: true, content: composer },
  { path: "README.md", bytes: readme.length, inline: true, content: readme },
  { path: "render.yaml", bytes: renderYaml.length, inline: true, content: renderYaml },
  { path: "tools/stp_make.py", bytes: stpMake.length, inline: true, content: stpMake },
];
