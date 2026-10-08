import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
await build({
  entryPoints: ["analyzer/worker.js"],
  outfile: "vendor/analyzer-worker.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "eof",
});
const dependencies = [
  "fflate",
  "acorn",
  "acorn-walk",
  "css-tree",
  "mdn-data",
  "source-map-js",
  "parse5",
  "entities",
];
let licenses =
  "STYLE FORGE v1.1 — bundled parser and archive library licenses\n\n";
for (const name of dependencies) {
  const p = JSON.parse(
    await readFile(`node_modules/${name}/package.json`, "utf8"),
  );
  let license = "";
  for (const file of ["LICENSE", "LICENSE.md", "LICENSE.txt"]) {
    try {
      license = await readFile(`node_modules/${name}/${file}`, "utf8");
      break;
    } catch {}
  }
  if (!license) throw Error("License missing: " + name);
  licenses += `--- ${name} ${p.version} ---\n${license}\n\n`;
}
await writeFile("vendor/LICENSES.txt", licenses.trimEnd() + "\n");
console.log("Bundled local worker and licenses; no runtime CDN needed.");

await build({
  entryPoints: ["visual/core.js"],
  outfile: "vendor/visual-editor.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  loader: { ".css": "text" },
  minify: true,
});
await build({
  entryPoints: ["extension/content-entry.js"],
  outfile: "extension/content.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  loader: { ".css": "text" },
  minify: true,
});
const { zipSync, strToU8 } = await import("fflate");
const extensionFiles = [
  "manifest.json",
  "background.js",
  "content.js",
  "README.md",
];
const zipEntries = {};
for (const file of extensionFiles)
  zipEntries["style-forge-extension/" + file] = strToU8(
    await readFile("extension/" + file, "utf8"),
  );
await writeFile("extension/style-forge-extension.zip", zipSync(zipEntries));
console.log("Built shared visual editor, MV3 extension and installable ZIP.");
