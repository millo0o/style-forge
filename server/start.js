import { Store } from "./store.js";
import { createApp } from "./app.js";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const store = await new Store(
  process.env.SF_DATA_DIR || resolve(homedir(), ".style-forge/server"),
).init();
if (!store.data.users.length) {
  console.error("먼저 npm run server:init으로 담당자 계정을 생성하세요.");
  process.exit(1);
}
const port = Number(process.env.PORT || 4319),
  host = process.env.SF_BIND || "127.0.0.1";
const manifest = JSON.parse(
  await readFile(
    new URL("../extension/manifest.json", import.meta.url),
    "utf8",
  ),
);
const extensionId = createHash("sha256")
  .update(Buffer.from(manifest.key, "base64"))
  .digest("hex")
  .slice(0, 32)
  .replace(/[0-9a-f]/g, (c) => String.fromCharCode(97 + parseInt(c, 16)));
const defaultOrigins =
  "https://millo0o.github.io,chrome-extension://" + extensionId;
const app = createApp(store, {
  origins: (process.env.SF_ALLOWED_ORIGINS || defaultOrigins)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
});
app.listen(port, host, () =>
  console.log(`STYLE FORGE 협업 서버 실행: ${host}:${port}`),
);
