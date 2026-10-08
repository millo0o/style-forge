import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { tmpdir } from "node:os";
import { zipSync, strToU8 } from "fflate";
const root = resolve(new URL("..", import.meta.url).pathname);
const server = createServer(async (req, res) => {
  try {
    const path = resolve(
      root,
      "." +
        decodeURIComponent(
          req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0],
        ),
    );
    if (!path.startsWith(root + "/")) throw Error("bad path");
    const data = await readFile(path);
    res.setHeader(
      "Content-Type",
      { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" }[
        extname(path)
      ] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
let browser, temp;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) => {
    if (!route.request().url().startsWith(base)) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto(base);
  // Existing v1.0 generation, persistence and export regression.
  await page.locator("#primary-hex").fill("#227744");
  await page.locator("#primary-hex").dispatchEvent("input");
  assert.equal(
    await page
      .locator(".button-samples .sf-button")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(34, 119, 68)",
  );
  await page.locator("#fontFamily").selectOption("serif");
  await page.locator("#cardRadius").fill("25");
  await page.locator("#cardRadius").dispatchEvent("input");
  assert.equal(
    await page
      .locator(".feature-card")
      .evaluate((el) => getComputedStyle(el).borderRadius),
    "25px",
  );
  await page.locator("#project-name").fill("회귀 테스트");
  await page.locator("#save-project").click();
  await page.reload();
  await page.locator("#saved-projects").selectOption({ label: "회귀 테스트" });
  await page.locator("#load-project").click();
  assert.equal(await page.locator("#primary").inputValue(), "#227744");
  await page.locator("#copy-css").click();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /--sf-primary: #227744/,
  );
  const cssDownload = page.waitForEvent("download");
  await page.locator("#download-css").click();
  assert.equal((await cssDownload).suggestedFilename(), "회귀 테스트.css");
  await page.locator('[data-workspace="analyzer"]').click();
  assert(await page.locator(".studio").isHidden());
  const sources = {
    "mobile1/index.html":
      '<!--@import(/layout/tab.html)-->\n<div class="box" id="hero" module="product_listmain_4"><a class="btn">테스트</a></div>\n<script>window.__skinRan=true;fetch("https://evil.invalid");</script>\n<img src="https://evil.invalid/a.png">',
    "mobile1/layout/tab.html": '<div class="moreBtn"><a>더보기</a></div>',
    "mobile1/css/main.css":
      "/* heading */\n.box .btn {color:red}\n@media (max-width:700px) {.moreBtn a{padding:8px}}",
    "mobile1/css/other.css": ".box .btn{color:blue}",
    "mobile1/js/main.js":
      '$(".btn").on("click",()=>{}); new Swiper("#hero",{});',
  };
  const zip = zipSync(
    Object.fromEntries(
      Object.entries(sources).map(([p, t]) => [p, strToU8(t)]),
    ),
  );
  await page
    .locator("#archive-input")
    .setInputFiles({
      name: "skin.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(zip),
    });
  await page.waitForFunction(() =>
    document
      .getElementById("analysis-status")
      .textContent.includes("분석 완료"),
  );
  assert.equal(await page.locator("#file-list .file-row").count(), 5);
  assert.equal(await page.evaluate(() => window.__skinRan), undefined);
  assert.deepEqual(external, []);
  await page.locator("#file-search").fill("css/");
  assert.equal(await page.locator("#file-list .file-row").count(), 2);
  await page.locator("#file-type").selectOption("js");
  assert.equal(await page.locator("#file-list .file-row").count(), 0);
  await page.locator("#file-search").fill("");
  await page.locator("#file-type").selectOption("all");
  await page.locator("#result-kind").selectOption("css");
  await page.locator("#selector-search").fill(".box .btn");
  await page.waitForFunction(
    () => document.getElementById("result-count").textContent === "2개 결과",
  );
  assert.equal(await page.locator(".analysis-result").count(), 2);
  assert.match(
    await page.locator(".analysis-result").first().textContent(),
    /중복 2개/,
  );
  await page
    .locator(".analysis-result")
    .first()
    .locator(".source-link")
    .first()
    .click();
  assert.equal(
    await page.locator("#source-title").textContent(),
    "mobile1/css/main.css",
  );
  assert.equal(
    await page.locator(".highlighted .source-number").textContent(),
    "2",
  );
  await page.locator("#selector-search").fill("");
  await page.locator("#result-kind").selectOption("refs");
  await page.waitForFunction(() =>
    document
      .getElementById("results-list")
      .textContent.includes("/layout/tab.html"),
  );
  await page
    .locator(".source-link")
    .filter({ hasText: "→ mobile1/layout/tab.html" })
    .click();
  assert.equal(
    await page.locator("#source-title").textContent(),
    "mobile1/layout/tab.html",
  );
  await page.locator("#result-kind").selectOption("js");
  await page.locator("#selector-search").fill(".btn");
  await page.waitForFunction(() =>
    document.getElementById("results-list").textContent.includes("click"),
  );
  const reportDownload = page.waitForEvent("download");
  await page.locator("#export-analysis").click();
  const d = await reportDownload;
  let report = "";
  for await (const chunk of await d.createReadStream()) report += chunk;
  const reportJSON = JSON.parse(report);
  assert.equal(reportJSON.stats.html, 2);
  assert(!Object.hasOwn(reportJSON.files[0], "content"));
  const sourceDownload = page.waitForEvent("download");
  await page.locator("#download-source").click();
  assert.equal((await sourceDownload).suggestedFilename(), "tab.html");
  // Unsafe archive keeps previous results and reports the failure.
  const unsafe = zipSync({ "../escape.html": strToU8("bad") });
  await page
    .locator("#archive-input")
    .setInputFiles({
      name: "bad.zip",
      mimeType: "application/zip",
      buffer: Buffer.from(unsafe),
    });
  await page.waitForFunction(() =>
    document
      .getElementById("analysis-status")
      .textContent.includes("분석 실패"),
  );
  assert.equal(await page.locator("#file-list .file-row").count(), 5);
  // Browser folder picker reads real nested File objects.
  temp = await mkdtemp(resolve(tmpdir(), "style-forge-fixture-"));
  for (const [path, value] of Object.entries(sources)) {
    const full = resolve(temp, path);
    await mkdir(resolve(full, ".."), { recursive: true });
    await writeFile(full, value);
  }
  await page.locator("#folder-input").setInputFiles(resolve(temp, "mobile1"));
  await page.waitForFunction(() =>
    document
      .getElementById("analysis-status")
      .textContent.includes("분석 완료"),
  );
  assert.equal(await page.locator("#file-list .file-row").count(), 5);
  if (process.env.STYLE_FORGE_SAMPLE) {
    await page
      .locator("#archive-input")
      .setInputFiles(process.env.STYLE_FORGE_SAMPLE);
    await page.waitForFunction(
      () =>
        document
          .getElementById("analysis-status")
          .textContent.includes("427개 소스 분석 완료"),
      {},
      { timeout: 30000 },
    );
    assert.equal(await page.locator("#file-list .file-row").count(), 427);
    await page.locator("#result-kind").selectOption("css");
    await page
      .locator("#selector-search")
      .fill(".main_prd_tab .tab_list .prd_tab_btn");
    await page.waitForFunction(() =>
      document
        .getElementById("results-list")
        .textContent.includes("mobile1/mill/css/layout.css:25"),
    );
    assert.match(
      await page.locator("#results-list").textContent(),
      /정적 구조 일치/,
    );
    await page.locator("#results-list .source-link").first().click();
    assert.equal(
      await page.locator("#source-title").textContent(),
      "mobile1/mill/css/layout.css",
    );
    assert.equal(
      await page.locator(".highlighted .source-number").textContent(),
      "25",
    );
  }
  await mkdir(resolve(root, "test-results"), { recursive: true });
  await page.screenshot({
    path: resolve(root, "test-results/analyzer-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: resolve(root, "test-results/analyzer-mobile.png"),
    fullPage: true,
  });
  await page.locator('[data-workspace="designer"]').click();
  assert(await page.locator(".studio").isVisible());
  assert.equal(await page.locator("#primary").inputValue(), "#227744");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: v1.0 regression; ZIP/folder" +
      (process.env.STYLE_FORGE_SAMPLE ? "/real TAR.GZ" : "") +
      "; search/mapping/line numbers; imports/events; JSON/source downloads; rejected unsafe paths; no uploaded script execution/external network; desktop/mobile.",
  );
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
  if (temp) await rm(temp, { recursive: true, force: true });
}
