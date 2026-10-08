import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { zipSync, gzipSync, strToU8 } from "fflate";
import { analyze } from "../analyzer/engine.js";
import { loadFiles, safePath, decodeSource } from "../analyzer/archive.js";
const fixture = [
  {
    path: "mobile1/index.html",
    type: "html",
    encoding: "UTF-8",
    content:
      '<!--@import(/mill/layout/tab.html)-->\n<!--@css(/css/main.css)-->\n<!--@js(/js/main.js)-->\n<!--@import(/missing.html)-->\n<script src="https://example.com/never.js"></script>',
  },
  {
    path: "mobile1/mill/layout/tab.html",
    type: "html",
    encoding: "UTF-8",
    content:
      '<div id="mainPrdTab">\n<div class="main_prd_tab" module="product_listmain_4"><ul class="tab_list"><li><a class="prd_tab_btn">전체</a></li></ul>\n<div class="moreBtn"><a>더보기</a></div>\n</div></div>\n<style>.inline { color: red; }</style>\n<script>$(".inline").on("click", function() {});</script>\n<div class="inline" onclick="alert(1)"></div>',
  },
  {
    path: "mobile1/css/main.css",
    type: "css",
    encoding: "UTF-8",
    content:
      "/* title */\n.main_prd_tab .tab_list .prd_tab_btn {color:red}\n@media (max-width: 700px) {\n.moreBtn a { color:blue !important; }\n}\n.moreBtn a:hover { color:green; }\n#mainPrdTab {padding:20px}\n.wrongParent .prd_tab_btn {color:pink}\n.main_prd_tab:not(.hidden) { display:block; }\n:where(#mainPrdTab) .moreBtn {display:block}\n",
  },
  {
    path: "mobile1/css/extra.css",
    type: "css",
    encoding: "UTF-8",
    content: ".moreBtn a { color: black; }\n.moreBtn a { padding: 1px; }",
  },
  {
    path: "mobile1/js/main.js",
    type: "js",
    encoding: "UTF-8",
    content:
      '$(".prd_tab_btn").on("click",function(){ $(this).addClass("active"); });\n$("body").on("click", ".moreBtn a", ()=>{});\ndocument.querySelector("#mainPrdTab").addEventListener("change",()=>{});\nnew Swiper("#mainSlide", {});\nconst el = document.getElementById("mainPrdTab");\nel.classList.toggle("hidden");\n// $(".fake").click(()=>{})',
  },
];
test("recursive source analysis, import resolution and module preservation", () => {
  const r = analyze(fixture);
  assert.deepEqual([r.stats.html, r.stats.css, r.stats.js], [2, 2, 1]);
  assert(r.symbols.some((s) => s.key === ".prd_tab_btn"));
  const ref = r.references.find(
    (v) => v.kind === "@import" && v.target.includes("tab"),
  );
  assert.equal(ref.resolved, "mobile1/mill/layout/tab.html");
  assert.equal(ref.line, 1);
  assert.equal(
    r.references.find((v) => v.target === "/missing.html").status,
    "미확인",
  );
  assert(
    r.references.some(
      (v) => v.kind === "module" && v.target === "product_listmain_4",
    ),
  );
  assert.equal(
    r.references.find((v) => v.target.startsWith("https:")).status,
    "외부/동적 참조",
  );
});
test("CSS duplicate selectors, source locations, conditional context, specificity and matching", () => {
  const r = analyze(fixture);
  const tab = r.rules.find(
    (v) => v.selector === ".main_prd_tab .tab_list .prd_tab_btn",
  );
  assert.equal(tab.line, 2);
  assert.equal(tab.matchCount, 1);
  assert.equal(tab.matches[0].file, "mobile1/mill/layout/tab.html");
  assert.deepEqual(tab.specificity, [0, 3, 0]);
  const more = r.rules.filter((v) => v.selector === ".moreBtn a");
  assert.equal(more.length, 3);
  assert(more.every((v) => v.matchCount === 1));
  assert(more.every((v) => v.duplicateCount === 3));
  assert(more[0].context.startsWith("@media"));
  assert(more[0].important);
  assert.equal(more[0].line, 4);
  assert.equal(
    r.rules.find((v) => v.selector.includes(":hover")).status,
    "이름 후보 · 구조/동적 상태 미확인",
  );
  assert.equal(
    r.rules.find((v) => v.selector.includes(".wrongParent")).matchCount,
    0,
  );
  assert.deepEqual(
    r.rules.find((v) => v.selector.includes(":where")).specificity,
    [0, 1, 0],
  );
  assert.equal(r.rules.find((v) => v.file.endsWith("tab.html")).line, 5);
});
test("JS AST event delegation, Swiper, DOM queries, inline scripts and class changes", () => {
  const r = analyze(fixture);
  assert(
    r.javascript.some(
      (v) =>
        v.selector === ".prd_tab_btn" &&
        v.event === "click" &&
        v.candidateCount === 1,
    ),
  );
  assert(
    r.javascript.some(
      (v) => v.selector === ".moreBtn a" && v.event.includes("위임"),
    ),
  );
  assert(
    r.javascript.some(
      (v) => v.selector === "#mainSlide" && v.event === "Swiper 초기화",
    ),
  );
  assert(
    r.javascript.some(
      (v) => v.selector === ".active" && v.event.includes("addClass"),
    ),
  );
  assert(
    r.javascript.some(
      (v) => v.selector === ".hidden" && v.event.includes("toggle"),
    ),
  );
  assert(
    r.javascript.some(
      (v) => v.selector === ".inline" && v.line === 6 && v.event === "click",
    ),
  );
  assert(!r.javascript.some((v) => v.selector === ".fake"));
});
test("incomplete JS produces explicit estimated fallback", () => {
  const r = analyze([
    { path: "bad.js", type: "js", content: '$(".candidate").on(' },
  ]);
  assert(r.warnings.length);
  assert.equal(r.javascript[0].status, "추정");
});
test("safe archive paths and text decoding", () => {
  for (const name of [
    "../escape.css",
    "/absolute.css",
    "C:/windows.css",
    "bad\\path.css",
  ])
    assert.throws(() => safePath(name));
  assert.equal(safePath("./mobile1/css/a.css"), "mobile1/css/a.css");
  assert.equal(decodeSource(strToU8("한글")).text, "한글");
});
test("ZIP keeps nested paths and ignores non-source files", async () => {
  const zip = zipSync(
    Object.fromEntries([
      ...fixture.map((f) => [f.path, strToU8(f.content)]),
      ["mobile1/image.png", new Uint8Array([0, 1, 2])],
    ]),
  );
  const r = await loadFiles({
    kind: "archive",
    file: new File([zip], "skin.zip"),
  });
  assert.equal(r.files.length, 5);
  assert.equal(r.totalFiles, 6);
  assert(r.files.some((f) => f.path === "mobile1/mill/layout/tab.html"));
});
test("unsafe ZIP path is rejected without reading or executing content", async () => {
  const zip = zipSync({
    "../escape.html": strToU8("<script>alert(1)</script>"),
  });
  await assert.rejects(
    loadFiles({ kind: "archive", file: new File([zip], "bad.zip") }),
    /상위 폴더/,
  );
});
function makeTar(entries) {
  const chunks = [];
  for (const [path, content] of entries) {
    const body = strToU8(content),
      h = new Uint8Array(512);
    h.set(strToU8(path));
    h.set(strToU8("0000644\0"), 100);
    h.set(strToU8(body.length.toString(8).padStart(11, "0") + "\0"), 124);
    h.fill(32, 148, 156);
    h[156] = 48;
    h.set(strToU8("ustar\0"), 257);
    const sum = h.reduce((a, b) => a + b, 0);
    h.set(strToU8(sum.toString(8).padStart(6, "0") + "\0 "), 148);
    chunks.push(h, body, new Uint8Array((512 - (body.length % 512)) % 512));
  }
  chunks.push(new Uint8Array(1024));
  const bytes = new Uint8Array(chunks.reduce((n, b) => n + b.length, 0));
  let p = 0;
  for (const b of chunks) {
    bytes.set(b, p);
    p += b.length;
  }
  return bytes;
}
test("TAR.GZ parses nested files and validates TAR header checksums", async () => {
  const bytes = makeTar(fixture.map((f) => [f.path, f.content]));
  const r = await loadFiles({
    kind: "archive",
    file: new File([gzipSync(bytes)], "skin.tar.gz"),
  });
  assert.equal(r.files.length, 5);
  bytes[0] ^= 1;
  await assert.rejects(
    loadFiles({ kind: "archive", file: new File([bytes], "bad.tar") }),
    /체크섬/,
  );
});
test("folder loading preserves relative paths", async () => {
  const files = fixture.map((f) => {
    const file = new File([f.content], f.path.split("/").at(-1));
    Object.defineProperty(file, "webkitRelativePath", { value: f.path });
    return file;
  });
  const r = await loadFiles({ kind: "folder", files });
  assert.equal(r.files.length, 5);
  assert.equal(r.files[0].path, "mobile1/css/extra.css");
});
test(
  "supplied local Cafe24 archive (optional, never committed)",
  { skip: !process.env.STYLE_FORGE_SAMPLE },
  async () => {
    const bytes = await readFile(process.env.STYLE_FORGE_SAMPLE);
    const loaded = await loadFiles({
      kind: "archive",
      file: new File([bytes], "sample.tar.gz"),
    });
    const r = analyze(loaded.files, loaded.warnings);
    assert.deepEqual([r.stats.html, r.stats.css, r.stats.js], [206, 171, 50]);
    const tab = r.rules.filter(
      (v) => v.selector === ".main_prd_tab .tab_list .prd_tab_btn",
    );
    assert(tab.length > 0);
    assert(tab.some((v) => v.matchCount > 0));
    assert(
      r.references.some(
        (v) => v.resolved === "mobile1/mill/layout/main_prd_tab.html",
      ),
    );
    console.log(
      "REAL SAMPLE",
      JSON.stringify({
        stats: r.stats,
        refs: r.references.length,
        jsReferences: r.javascript.length,
        warnings: r.warnings.length,
        tab: tab.map(({ selector, file, line, matchCount }) => ({
          selector,
          file,
          line,
          matchCount,
        })),
      }),
    );
  },
);

test("CSS imports resolve relative paths without making network requests", () => {
  const r = analyze([
    {
      path: "skin/css/main.css",
      type: "css",
      content:
        '@import "./other.css";\n@import url("https://external.invalid/css");',
    },
    { path: "skin/css/other.css", type: "css", content: ".x{color:red}" },
  ]);
  assert.equal(r.references[0].resolved, "skin/css/other.css");
  assert.equal(r.references[1].status, "외부/동적 참조");
});

test("truncated ZIP and oversized source files are rejected", async () => {
  const bytes = zipSync({ "skin/a.css": strToU8(".a{color:red}") });
  await assert.rejects(
    loadFiles({
      kind: "archive",
      file: new File([bytes.subarray(0, bytes.length - 12)], "bad.zip"),
    }),
    /ZIP/,
  );
  const large = zipSync({
    "skin/large.css": new Uint8Array(5 * 1024 * 1024 + 1),
  });
  await assert.rejects(
    loadFiles({ kind: "archive", file: new File([large], "large.zip") }),
    /5 MB/,
  );
});
