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
  "basic-ftp",
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
await build({
  entryPoints: ["collaboration/ui.js"],
  outfile: "extension/review.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});
await writeFile(
  "extension/review.html",
  '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>STYLE FORGE 협업 검토함</title><link rel="stylesheet" href="review.css"></head><body>' +
    (await readFile("collaboration/workspace.html", "utf8"))
      .replace(" hidden>", ">")
      .replace(
        'href="connector/style-forge-mac.zip"',
        'href="https://millo0o.github.io/style-forge/connector/style-forge-mac.zip"',
      ) +
    '<script type="module" src="review.js"></script></body></html>',
);
await writeFile(
  "extension/review.css",
  await readFile("collaboration/style.css", "utf8"),
);
await build({
  entryPoints: ["connector/cli.js"],
  outfile: "connector/connector.cjs",
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  minify: true,
});
const { zipSync, strToU8 } = await import("fflate");
const zipEntries = {};
for (const file of [
  "manifest.json",
  "background.js",
  "content.js",
  "README.md",
  "review.html",
  "review.js",
  "review.css",
])
  zipEntries["style-forge-extension/" + file] = strToU8(
    await readFile("extension/" + file, "utf8"),
  );
await writeFile("extension/style-forge-extension.zip", zipSync(zipEntries));
await writeFile(
  "connector/LICENSES.txt",
  (await readFile("node_modules/basic-ftp/LICENSE.txt", "utf8")).trimEnd() +
    "\n",
);
const macEntries = {};
for (const file of [
  "connector.cjs",
  "connector.example.json",
  "START-MAC.command",
  "README.md",
  "LICENSES.txt",
])
  macEntries["style-forge-mac/" + file] = strToU8(
    await readFile("connector/" + file, "utf8"),
  );
await writeFile("connector/style-forge-mac.zip", zipSync(macEntries));
console.log(
  "Built editor, collaboration portal, MV3 ZIP and Mac approval connector.",
);
