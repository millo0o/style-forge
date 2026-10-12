import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../server/store.js";
import { createApp } from "../server/app.js";
import {
  LocalTransport,
  prepare,
  apply,
  verifyBundle,
} from "../connector/deploy.js";
const dir = await mkdtemp(resolve(tmpdir(), "sf-collab-browser-")),
  store = await new Store(resolve(dir, "db")).init();
const reviewer = await store.addUser({
    email: "reviewer@example.test",
    name: "담당자",
    password: "TestOnlyPassword123",
    role: "reviewer",
  }),
  client = await store.addUser({
    email: "client@example.test",
    name: "클라이언트",
    password: "TestOnlyPassword123",
    role: "client",
  });
const app = createApp(store);
await new Promise((r) => app.listen(0, "127.0.0.1", r));
const url = "http://127.0.0.1:" + app.address().port;
await store.addProject(reviewer, {
  name: "테스트 쇼핑몰",
  origin: url,
  clientIds: [client.id],
});
let browser;
async function downloadedJSON(page, click) {
  const event = page.waitForEvent("download");
  await click();
  const d = await event;
  let data = "";
  for await (const chunk of await d.createReadStream()) data += chunk;
  return JSON.parse(data);
}
async function login(page, email) {
  await page.locator('[data-workspace="collaboration"]').click();
  await page.locator("#collab-mode").selectOption("server");
  await page.locator("#collab-api").fill(url);
  await page.locator("#collab-email").fill(email);
  await page.locator("#collab-password").fill("TestOnlyPassword123");
  await page.locator("#collab-login button").click();
  await page
    .locator("#collab-status")
    .filter({ hasText: "로그인했습니다" })
    .waitFor();
}
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      acceptDownloads: true,
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.locator('[data-workspace="collaboration"]').click();
  assert.match(
    await page.locator("#collab-mode-banner").textContent(),
    /로컬 체험/,
  );
  await page.locator(".collab-request").first().click();
  await page
    .getByRole("button", { name: "수정 영역 체험 화면 열기", exact: true })
    .click();
  const demo = page.frameLocator(".collab-demo-frame");
  await demo.locator(".review-badge").first().waitFor();
  assert.equal(await demo.locator(".review-mark").count(), 3);
  assert.equal(
    await demo
      .locator(".shop-title")
      .evaluate((e) => getComputedStyle(e).fontSize),
    "42px",
  );
  await demo
    .getByRole("button", { name: "수정 영역 표시 끄기", exact: true })
    .click();
  assert(await demo.locator(".review-badge").first().isHidden());
  await demo
    .getByRole("button", { name: "수정 영역 표시 켜기", exact: true })
    .click();
  assert(await demo.locator(".review-badge").first().isVisible());
  // Client exports observed edits, then submits them through the real server.
  await page.locator('[data-workspace="visual"]').click();
  const visual = page.frameLocator("#visual-demo-frame");
  await visual.locator(".shop-title").click();
  await visual.locator('[data-property="font-size"]').fill("44");
  const payload = await downloadedJSON(page, () =>
    visual.getByRole("button", { name: "검토 요청 파일", exact: true }).click(),
  );
  assert.equal(payload.items[0].before["font-size"], "38px");
  payload.items.push({
    pageUrl: url + "/company.html",
    selector: ".company-title",
    media: "all",
    properties: { color: "#112233" },
    before: { color: "#222222" },
    label: "회사 소개 제목",
    important: true,
  });
  await visual
    .locator('input[aria-label="홈페이지 표시 JSON"]')
    .setInputFiles({
      name: "customer-request.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(payload)),
    });
  await visual.locator(".review-badge").first().waitFor();
  assert.match(
    await visual.locator(".review-badge").first().textContent(),
    /수정 요청/,
  );
  await login(page, client.email);
  assert(await page.locator("#collab-admin").isHidden());
  await page.locator("#collab-submit-files").setInputFiles({
    name: "request.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload)),
  });
  await page.locator("#collab-title").fill("홈페이지 2개 페이지 수정");
  await page
    .locator("#collab-note")
    .fill("메인 제목과 소개 페이지 색상을 검토해주세요.");
  await page.locator("#collab-submit-form button").click();
  await page
    .locator("#collab-status")
    .filter({ hasText: "제출했습니다" })
    .waitFor();
  await page
    .locator(".collab-request")
    .filter({ hasText: "홈페이지 2개" })
    .click();
  assert.match(
    await page.locator(".collab-request").textContent(),
    /2개 페이지/,
  );
  assert.equal(
    await page.getByRole("button", { name: "검토 저장", exact: true }).count(),
    0,
  );
  const admin = await context.newPage();
  admin.on("pageerror", (e) => errors.push(e.message));
  await admin.goto(url);
  await login(admin, reviewer.email);
  await admin
    .locator(".collab-request")
    .filter({ hasText: "홈페이지 2개" })
    .click();
  const bundleButton = admin.getByRole("button", {
    name: "승인 적용 패키지 받기",
    exact: true,
  });
  assert(await bundleButton.isDisabled());
  const packet = await downloadedJSON(admin, () =>
    admin
      .getByRole("button", { name: "홈페이지 표시 JSON", exact: true })
      .click(),
  );
  assert.equal(packet.items.length, 2);
  // The reviewer sees markers on the matching page, and edits never write to shop files.
  await page.locator('[data-workspace="visual"]').click();
  await visual.locator('input[aria-label="홈페이지 표시 JSON"]').setInputFiles({
    name: "review.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(packet)),
  });
  await visual.locator(".review-badge").first().waitFor();
  assert.equal(await visual.locator(".review-mark").count(), 1);
  assert.match(
    await visual.locator(".status").textContent(),
    /운영 반영이 아닙니다/,
  );
  await admin
    .locator(".collab-review-controls")
    .first()
    .locator("input")
    .fill("확인했습니다");
  await admin
    .locator(".collab-review-controls")
    .first()
    .locator("button")
    .click();
  await admin
    .locator(".collab-item .badge")
    .first()
    .filter({ hasText: "승인" })
    .waitFor();
  await admin
    .locator(".collab-review-controls")
    .nth(1)
    .locator("select")
    .selectOption("revision_requested");
  await admin
    .locator(".collab-review-controls")
    .nth(1)
    .locator("input")
    .fill("소개 페이지 색상을 조금 밝게");
  await admin
    .locator(".collab-review-controls")
    .nth(1)
    .locator("button")
    .click();
  await admin
    .locator(".collab-item .badge")
    .nth(1)
    .filter({ hasText: "수정 요청" })
    .waitFor();
  const bundle = await downloadedJSON(admin, () => bundleButton.click());
  assert.equal(bundle.payload.items.length, 1);
  assert.equal(
    verifyBundle(bundle, store.data.keys.publicKey, url).items[0].properties[
      "font-size"
    ],
    "44px",
  );
  await mkdir(resolve(dir, "skin/layout"), { recursive: true });
  await writeFile(
    resolve(dir, "skin/layout/main.html"),
    "<html><head></head><body>unchanged</body></html>",
  );
  const transport = new LocalTransport(resolve(dir, "skin")),
    config = {
      origin: url,
      layoutPath: "layout/main.html",
      publicKey: store.data.keys.publicKey,
    };
  const plan = await prepare(transport, bundle, config);
  const receipt = await apply(transport, plan, resolve(dir, "backup"));
  await admin
    .locator(".collab-file input")
    .last()
    .setInputFiles({
      name: "receipt.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(receipt)),
    });
  await admin
    .locator(".collab-item .badge")
    .first()
    .filter({ hasText: "적용 완료" })
    .waitFor();
  await page.locator('[data-workspace="collaboration"]').click();
  await page.locator("#collab-refresh").click();
  await page.locator(".collab-request").first().click();
  await page
    .getByRole("button", { name: "재수정 요청에 답하기", exact: true })
    .click();
  const revised = {
    format: "style-forge-submission-v1",
    items: [{ ...payload.items[1], properties: { color: "#778899" } }],
  };
  await page.locator("#collab-submit-files").setInputFiles({
    name: "revised.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(revised)),
  });
  await page.locator("#collab-submit-form button").click();
  await page
    .locator(".collab-request")
    .filter({ hasText: "[재수정]" })
    .waitFor();
  assert.equal(store.data.requests.length, 2);
  assert(store.data.requests[1].supersedes);
  await mkdir(resolve(process.cwd(), "test-results"), { recursive: true });
  await admin.screenshot({
    path: "test-results/collaboration-desktop.png",
    fullPage: true,
  });
  await admin.setViewportSize({ width: 390, height: 844 });
  assert(
    await admin.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await admin.screenshot({
    path: "test-results/collaboration-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real client/reviewer login, 2-page submission, reviewer-only decisions, revision request/resubmission, live changed-region badges, before/after values, approved-only signed package, local backup/apply and reported receipt, mobile layout.",
  );
} finally {
  await browser?.close();
  await new Promise((r) => app.close(r));
  await rm(dir, { recursive: true, force: true });
}
