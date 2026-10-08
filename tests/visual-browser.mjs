import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { unzipSync, strFromU8 } from "fflate";
const root = resolve(new URL("..", import.meta.url).pathname);
const server = createServer(async (req, res) => {
  try {
    const raw = decodeURIComponent(req.url.split("?")[0]),
      path = resolve(root, "." + (raw === "/" ? "/index.html" : raw));
    if (!path.startsWith(root + "/")) throw Error();
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".zip": "application/zip",
      }[extname(path)] || "application/octet-stream",
    );
    res.end(await readFile(path));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    permissions: ["clipboard-read", "clipboard-write"],
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) => {
    if (!route.request().url().startsWith(url)) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto(url);
  await page.locator('[data-workspace="visual"]').click();
  const frame = page.frameLocator("#visual-demo-frame");
  const panel = frame.locator("style-forge-editor .panel");
  await panel.waitFor();
  const font = frame.locator('[data-property="font-size"]'),
    getFont = () =>
      frame
        .locator(".shop-title")
        .evaluate((e) => getComputedStyle(e).fontSize);
  assert.equal(await getFont(), "38px");
  await frame.locator(".shop-title").click();
  await font.fill("48");
  assert.equal(await getFont(), "48px");
  await frame.getByTitle("실행 취소", { exact: true }).click();
  assert.equal(await getFont(), "38px");
  await frame.getByTitle("다시 실행", { exact: true }).click();
  assert.equal(await getFont(), "48px");
  await frame.getByRole("button", { name: "원본 비교", exact: true }).click();
  assert.equal(await getFont(), "38px");
  await frame
    .getByRole("button", { name: "변경 화면 보기", exact: true })
    .click();
  assert.equal(await getFont(), "48px");
  await frame.locator('[data-property="color"]').evaluate((e) => {
    e.value = "#b14a66";
    e.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.equal(
    await frame
      .locator(".shop-title")
      .evaluate((e) => getComputedStyle(e).color),
    "rgb(177, 74, 102)",
  );
  // Responsive rule is saved without pretending it applies outside its breakpoint.
  await frame
    .locator(".selector-controls select")
    .nth(1)
    .selectOption("mobile");
  await font.fill("23");
  assert.equal(await getFont(), "48px");
  assert.match(
    await frame.locator(".count").textContent(),
    /미디어 조건 미충족/,
  );
  await page.locator('[data-visual-device="mobile"]').click();
  assert.equal(await getFont(), "23px");
  await page.locator('[data-visual-device="desktop"]').click();
  assert.equal(await getFont(), "48px");
  await frame.locator(".selector-controls select").nth(1).selectOption("all");
  // Shared scope updates both cards, while click selection suppresses website handlers.
  await frame.locator(".product-button").first().click();
  await frame
    .locator(".selector-controls select")
    .first()
    .selectOption("shared");
  assert.match(await frame.locator(".count").textContent(), /대상 2개/);
  await frame.locator('[data-property="padding-left"]').fill("36");
  const pads = await frame
    .locator(".product-button")
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).paddingLeft));
  assert.deepEqual(pads, ["36px", "36px"]);
  // Native selector validation cannot import arbitrary style payloads.
  await frame.locator(".selector-row input").fill(".bad{color:red}");
  await frame.locator(".selector-row button").click();
  assert.match(await frame.locator(".status").textContent(), /올바른 CSS/);
  await frame.locator(".shop-title").click();
  const report = {
    files: [{ path: "demo/css/main.css" }],
    rules: [
      {
        selector: ".shop-title",
        file: "demo/css/main.css",
        line: 25,
        context: "기본",
      },
      {
        selector: ".missing",
        file: "demo/css/main.css",
        line: 3,
        context: "기본",
      },
    ],
  };
  await frame
    .locator('input[aria-label="스킨 분석 JSON 연결"]')
    .setInputFiles({
      name: "analysis.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(report)),
    });
  await frame
    .locator(".source-card strong")
    .filter({ hasText: "demo/css/main.css:25" })
    .waitFor();
  assert.match(
    await frame.locator(".source-card").first().textContent(),
    /미확인/,
  );
  await frame.getByText("현재 적용 CSS와 구조", { exact: true }).click();
  await frame
    .locator("details .source-card")
    .filter({ hasText: "font-size: 48px" })
    .first()
    .waitFor();
  await frame.getByRole("button", { name: "CSS 복사", exact: true }).click();
  await frame
    .locator(".status")
    .filter({ hasText: "CSS를 복사했습니다." })
    .waitFor();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /font-size: 48px !important/,
  );
  const cssEvent = page.waitForEvent("download");
  await frame
    .getByRole("button", { name: "CSS 다운로드", exact: true })
    .click();
  const cssDownload = await cssEvent;
  assert.equal(cssDownload.suggestedFilename(), "style-forge-overrides.css");
  let css = "";
  for await (const b of await cssDownload.createReadStream()) css += b;
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /padding-left: 36px/);
  await frame.getByRole("button", { name: "편집 저장", exact: true }).click();
  await frame
    .locator(".status")
    .filter({ hasText: "브라우저에 저장" })
    .waitFor();
  const jsonEvent = page.waitForEvent("download");
  await frame.getByRole("button", { name: "편집 JSON", exact: true }).click();
  const jsonDownload = await jsonEvent;
  let project = "";
  for await (const b of await jsonDownload.createReadStream()) project += b;
  assert.equal(JSON.parse(project).state.version, "1.2");
  page.once("dialog", (d) => d.accept());
  await frame
    .getByRole("button", { name: "모든 변경 제거", exact: true })
    .click();
  assert.equal(await getFont(), "38px");
  await frame
    .getByRole("button", { name: "저장 불러오기", exact: true })
    .click();
  assert.equal(await getFont(), "48px");
  assert(
    (await frame
      .locator(".source-card strong")
      .filter({ hasText: "demo/css/main.css:25" })
      .count()) > 0,
  );
  page.once("dialog", (d) => d.accept());
  await frame
    .getByRole("button", { name: "모든 변경 제거", exact: true })
    .click();
  await frame
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles({
      name: "edit.json",
      mimeType: "application/json",
      buffer: Buffer.from(project),
    });
  await frame
    .locator(".status")
    .filter({ hasText: "편집 JSON을 불러왔습니다" })
    .waitFor();
  assert.equal(await getFont(), "48px");
  // Bad JSON must not replace the previous edit state.
  await frame
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          state: {
            changes: [
              {
                selector: "body",
                media: "all",
                properties: { background: "url(https://evil.invalid)" },
              },
            ],
          },
        }),
      ),
    });
  await frame
    .locator(".status")
    .filter({ hasText: "읽지 못했습니다" })
    .waitFor();
  assert.equal(await getFont(), "48px");
  if (process.env.STYLE_FORGE_SAMPLE) {
    const { loadFiles } = await import("../analyzer/archive.js"),
      { analyze } = await import("../analyzer/engine.js");
    const bytes = await readFile(process.env.STYLE_FORGE_SAMPLE);
    const loaded = await loadFiles({
      kind: "archive",
      file: new File([bytes], "sample.tar.gz"),
    });
    const analysis = analyze(loaded.files, loaded.warnings);
    const map = {
      files: analysis.files.map(({ path, type }) => ({ path, type })),
      rules: analysis.rules.map(({ selector, file, line, context }) => ({
        selector,
        file,
        line,
        context,
      })),
    };
    await frame.locator(".shop-title").evaluate((e) => {
      e.classList.add("prd_tab_btn");
      e.parentElement.classList.add("tab_list");
      e.closest("main").classList.add("main_prd_tab");
    });
    await frame.locator(".shop-title").click();
    await frame
      .locator('input[aria-label="스킨 분석 JSON 연결"]')
      .setInputFiles({
        name: "real-visual-map.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(map)),
      });
    await frame
      .locator(".source-card strong")
      .filter({ hasText: "mobile1/mill/css/layout.css:25" })
      .waitFor();
  }
  await panel.evaluate((e) => {
    e.scrollTop = 0;
  });
  await mkdir(resolve(root, "test-results"), { recursive: true });
  await page.screenshot({
    path: resolve(root, "test-results/visual-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.locator('[data-visual-device="mobile"]').click();
  await page.screenshot({
    path: resolve(root, "test-results/visual-mobile.png"),
    fullPage: true,
  });
  page.once("dialog", (d) => d.accept());
  await frame
    .getByRole("button", { name: "편집기 닫기 · 임시 변경 제거", exact: true })
    .click();
  assert.equal(await frame.locator("style-forge-editor").count(), 0);
  assert.equal(await getFont(), "31px");
  await page.locator("#restart-editor").click();
  await panel.waitFor();
  // Packaged extension must be installable independently of the source repository.
  const zipEvent = page.waitForEvent("download");
  await page.locator(".visual-download").click();
  const zipDownload = await zipEvent;
  const zip = unzipSync(await readFile(await zipDownload.path()));
  const manifest = JSON.parse(
    strFromU8(zip["style-forge-extension/manifest.json"]),
  );
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "storage"]);
  assert(!manifest.host_permissions);
  assert(zip["style-forge-extension/content.js"]);
  assert(zip["style-forge-extension/background.js"]);
  await page.locator("#shop-url").fill("javascript:alert(1)");
  await page.locator("#open-shop").click();
  assert.match(
    await page.locator("#visual-web-status").textContent(),
    /https:\/\//,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: visual pick/edit, undo/redo, comparison, multi-element scope, responsive CSS, live source mapping, computed styles, copy/download, save/load/import validation, cleanup, mobile layout, MV3 ZIP; no external requests or browser errors.",
  );
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
