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
await writeFile("vendor/LICENSES.txt", licenses);
console.log("Bundled local worker and licenses; no runtime CDN needed.");
