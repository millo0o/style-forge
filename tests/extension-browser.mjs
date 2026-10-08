import { chromium } from "playwright";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile, cp, rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
const root = resolve(new URL("..", import.meta.url).pathname);
const temporary = await mkdtemp(resolve(tmpdir(), "style-forge-mv3-"));
const server = createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(
    '<!DOCTYPE html><html><body><h1 id="title" style="font-size:20px!important">실제 확장 테스트</h1><a id="link" href="/next">이동</a></body></html>',
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let context;
try {
  const path = resolve(temporary, "extension");
  await cp(resolve(root, "extension"), path, { recursive: true });
  const manifest = JSON.parse(
    await readFile(resolve(path, "manifest.json"), "utf8"),
  );
  // Only the TEMPORARY test copy gets a loopback host permission so automation can
  // invoke the action handler without fabricating an activeTab user gesture.
  manifest.host_permissions = ["http://127.0.0.1/*"];
  await writeFile(resolve(path, "manifest.json"), JSON.stringify(manifest));
  context = await chromium.launchPersistentContext(
    resolve(temporary, "profile"),
    {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--enable-unsafe-extension-debugging"],
    },
  );
  const session = await context.browser().newBrowserCDPSession();
  let installed;
  try {
    installed = await session.send("Extensions.loadUnpacked", { path });
  } catch (e) {
    if (e.message.includes("disabled by the administrator")) {
      const reason =
        "SKIP: Chromium administration policy blocks unpacked extension installation. Shared editor browser tests and mocked API contracts run separately; real extension installation remains unverified.";
      console.log(reason);
      await mkdir(resolve(root, "test-results"), { recursive: true });
      await writeFile(
        resolve(root, "test-results/extension-runtime.txt"),
        reason + "\n",
      );
      process.exitCode = 0;
    } else throw e;
  }
  if (installed) {
    const worker =
      context.serviceWorkers()[0] ||
      (await context.waitForEvent("serviceworker"));
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await worker.evaluate(async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      await openStyleForge(tab);
    });
    await page.locator("style-forge-editor").waitFor();
    await page.locator("#title").click();
    await page.locator('[data-property="font-size"]').fill("42");
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("title")).fontSize === "42px",
    );
    await page.getByRole("button", { name: "원본 비교", exact: true }).click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("title")).fontSize === "20px",
    );
    await page
      .getByRole("button", { name: "변경 화면 보기", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("title")).fontSize === "42px",
    );
    await page.getByRole("button", { name: "편집 저장", exact: true }).click();
    assert.match(await page.locator(".status").textContent(), /저장/);
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", {
        name: "편집기 닫기 · 임시 변경 제거",
        exact: true,
      })
      .click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.getElementById("title")).fontSize === "20px",
    );
    console.log(
      "PASS: actual MV3 installation/action injection, USER-origin CSS, original comparison, chrome.storage and cleanup on loopback fixture.",
    );
  }
} finally {
  await context?.close();
  await new Promise((r) => server.close(r));
  await rm(temporary, { recursive: true, force: true });
}
