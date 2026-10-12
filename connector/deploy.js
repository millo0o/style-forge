import {
  readFile,
  writeFile,
  mkdir,
  rename,
  realpath,
  lstat,
  unlink,
} from "node:fs/promises";
import { resolve, dirname, posix } from "node:path";
import { createHash, verify, randomUUID } from "node:crypto";
import { Readable, Writable } from "node:stream";
import { Client } from "basic-ftp";
import { validateItems, itemCSS } from "../collaboration/schema.js";
export const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function verifyBundle(bundle, publicKey, origin) {
  if (
    bundle?.payload?.format !== "style-forge-approved-v1" ||
    !verify(
      null,
      Buffer.from(JSON.stringify(bundle.payload)),
      publicKey,
      Buffer.from(bundle.signature || "", "base64"),
    )
  )
    throw Error("담당자 서버의 승인 서명을 확인하지 못했습니다.");
  const p = bundle.payload;
  if (
    p.origin !== origin ||
    !Number.isFinite(new Date(p.expiresAt).getTime()) ||
    new Date(p.expiresAt).getTime() < Date.now() ||
    !p.items?.length ||
    p.items.some((i) => i.status !== "approved")
  )
    throw Error("승인 대상·유효 기간·사이트를 확인하세요.");
  validateItems(p.items, origin);
  return p;
}
export function pathSafe(path) {
  if (
    typeof path !== "string" ||
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path.split("/").some((s) => s === ".." || s === ".") ||
    /[\x00-\x1f]/.test(path)
  )
    throw Error("스킨 내부의 상대 경로만 허용합니다.");
  return path;
}
export class LocalTransport {
  constructor(root) {
    this.root = resolve(root);
  }
  async safe(path) {
    pathSafe(path);
    const full = resolve(this.root, path);
    const root = await realpath(this.root);
    if (root !== this.root)
      throw Error("로컬 스킨 루트는 실제 경로를 사용하세요.");
    let current = this.root;
    for (const p of path.split("/")) {
      current = resolve(current, p);
      try {
        const st = await lstat(current);
        if (st.isSymbolicLink())
          throw Error("심볼릭 링크 경로에는 적용하지 않습니다.");
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    }
    if (!full.startsWith(root + "/")) throw Error("스킨 루트 밖 경로");
    return full;
  }
  async read(path) {
    try {
      return await readFile(await this.safe(path));
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  }
  async write(path, bytes) {
    const full = await this.safe(path);
    await mkdir(dirname(full), { recursive: true });
    const temp = full + ".sf-tmp-" + randomUUID();
    await writeFile(temp, bytes, { mode: 0o600 });
    await rename(temp, full);
  }
  async remove(path) {
    await unlink(await this.safe(path)).catch((e) => {
      if (e.code !== "ENOENT") throw e;
    });
  }
  async close() {}
}
export class FTPTransport {
  constructor(config) {
    this.config = config;
    this.client = new Client(15000);
    this.client.ftp.verbose = false;
  }
  async connect(password) {
    const c = this.config;
    if (
      !["ftp", "ftps"].includes(c.protocol) ||
      !c.host ||
      /[\/\r\n]/.test(c.host) ||
      !c.root?.startsWith("/") ||
      /[\r\n]/.test(c.root)
    )
      throw Error("FTP 연결 설정을 확인하세요.");
    if (c.protocol === "ftp" && !c.allowPlainFTP)
      throw Error(
        "평문 FTP는 allowPlainFTP를 명시적으로 설정해야 합니다. 가능하면 FTPS를 사용하세요.",
      );
    await this.client.access({
      host: c.host,
      port: Number(c.port || 21),
      user: c.user,
      password,
      secure: c.protocol === "ftps",
      secureOptions: { rejectUnauthorized: true },
    });
    await this.client.cd(c.root);
    this.base = await this.client.pwd();
  }
  async target(path, create = false) {
    pathSafe(path);
    const parts = path.split("/");
    await this.client.cd(this.base);
    for (const part of parts.slice(0, -1)) {
      const list = await this.client.list();
      const entry = list.find((e) => e.name === part);
      if (entry?.isSymbolicLink)
        throw Error("원격 심볼릭 링크에는 적용하지 않습니다.");
      if (!entry) {
        if (!create) return { leaf: parts.at(-1), entry: null, missing: true };
        await this.client.send("MKD " + part);
        await this.client.cd(part);
      } else {
        if (!entry.isDirectory) throw Error("폴더 경로를 확인하세요.");
        await this.client.cd(part);
      }
    }
    const list = await this.client.list(),
      leaf = parts.at(-1),
      entry = list.find((e) => e.name === leaf);
    if (entry?.isSymbolicLink)
      throw Error("원격 심볼릭 링크에는 적용하지 않습니다.");
    return { leaf, entry };
  }
  async read(path) {
    const { leaf, entry } = await this.target(path);
    if (!entry) return null;
    if (entry.size > 5 * 1024 * 1024)
      throw Error("기존 파일은 5 MB 이하여야 합니다.");
    let chunks = [],
      length = 0;
    const stream = new Writable({
      write(c, e, cb) {
        length += c.length;
        if (length > 5 * 1024 * 1024) return cb(Error("파일 크기 제한"));
        chunks.push(c);
        cb();
      },
    });
    await this.client.downloadTo(stream, leaf);
    return Buffer.concat(chunks);
  }
  async write(path, bytes) {
    const { leaf } = await this.target(path, true),
      temp = leaf + ".sf-tmp-" + randomUUID();
    await this.client.uploadFrom(Readable.from([bytes]), temp);
    await this.client.rename(temp, leaf);
  }
  async remove(path) {
    const { leaf, entry } = await this.target(path);
    if (entry) await this.client.remove(leaf);
  }
  async close() {
    this.client.close();
  }
}
function validManifest(raw, origin) {
  if (raw === null)
    return {
      format: "style-forge-deploy-v1",
      origin,
      pages: {},
      appliedIds: [],
    };
  const m = JSON.parse(raw.toString("utf8"));
  if (
    m.format !== "style-forge-deploy-v1" ||
    m.origin !== origin ||
    !m.pages ||
    !Array.isArray(m.appliedIds)
  )
    throw Error("기존 STYLE FORGE 적용 manifest를 확인하세요.");
  for (const [url, paths] of Object.entries(m.pages)) {
    if (
      new URL(url).origin !== origin ||
      !Array.isArray(paths) ||
      paths.some(
        (p) => typeof p !== "string" || !/^pages\/[a-f0-9-]+\.css$/.test(p),
      )
    )
      throw Error("기존 manifest 경로 오류");
  }
  return m;
}
export async function prepare(transport, bundle, config) {
  const payload = verifyBundle(bundle, config.publicKey, config.origin),
    base = pathSafe(config.outputPath || "mill/style-forge"),
    layout = pathSafe(config.layoutPath);
  const publicBase = config.publicBase || "/mill/style-forge";
  if (publicBase.startsWith("//") || !/^\/[a-zA-Z0-9_/-]+$/.test(publicBase))
    throw Error("publicBase는 사이트 내부 URL 경로여야 합니다.");
  const layoutBytes = await transport.read(layout);
  if (!layoutBytes) throw Error("공통 레이아웃 파일을 찾을 수 없습니다.");
  let html;
  try {
    html = new TextDecoder("utf-8", { fatal: true }).decode(layoutBytes);
  } catch {
    throw Error(
      "현재 자동 연결은 UTF-8 레이아웃만 지원합니다. 기존 파일 인코딩을 먼저 확인하세요.",
    );
  }
  const manifestPath = base + "/manifest.json",
    manifestBytes = await transport.read(manifestPath),
    manifest = validManifest(manifestBytes, config.origin);
  if (payload.items.some((i) => manifest.appliedIds.includes(i.id)))
    throw Error("이미 적용한 항목이 포함되어 있습니다.");
  const files = [];
  for (const url of [...new Set(payload.items.map((i) => i.pageUrl))]) {
    const items = payload.items.filter((i) => i.pageUrl === url),
      name =
        "pages/" + sha(url + "|" + JSON.stringify(items)).slice(0, 32) + ".css";
    manifest.pages[url] = [...(manifest.pages[url] || []), name];
    files.push({
      path: base + "/" + name,
      after: Buffer.from(items.map(itemCSS).join("\n")),
    });
  }
  manifest.appliedIds.push(...payload.items.map((i) => i.id));
  const tag =
    config.layoutMode === "html"
      ? `<script src="${publicBase}/loader.js" defer></script>`
      : `<!--@js(${publicBase}/loader.js)-->`;
  if (!html.includes(tag)) {
    if (!/<\/head\s*>/i.test(html))
      throw Error("레이아웃의 </head> 연결 위치를 확인하세요.");
    html = html.replace(/<\/head\s*>/i, tag + "\n</head>");
  }
  const mapping = Object.fromEntries(
    Object.entries(manifest.pages).map(([url, paths]) => [
      url,
      paths.map((p) => publicBase + "/" + p),
    ]),
  );
  const loader = `/* STYLE FORGE approved page styles */\n(()=>{const map=${JSON.stringify(mapping)};const page=new URL(location.href);page.searchParams.sort();const url=page.origin+page.pathname+page.search;for(const href of map[url]||[]){if([...document.querySelectorAll('link[data-style-forge]')].some(n=>n.getAttribute('href')===href))continue;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.styleForge='approved';document.head.append(link);}})();\n`;
  files.push(
    { path: base + "/loader.js", after: Buffer.from(loader) },
    {
      path: manifestPath,
      after: Buffer.from(JSON.stringify(manifest, null, 2)),
    },
    { path: layout, after: Buffer.from(html) },
  );
  for (const f of files) {
    f.before =
      f.path === manifestPath
        ? manifestBytes
        : f.path === layout
          ? layoutBytes
          : await transport.read(f.path);
    f.beforeHash = f.before === null ? null : sha(f.before);
    f.afterHash = sha(f.after);
  }
  return {
    id: randomUUID(),
    payload,
    files,
    authorization: {
      bundle,
      publicKey: config.publicKey,
      origin: config.origin,
    },
  };
}
export async function apply(
  transport,
  plan,
  backupDir,
  authorize = async () => {},
) {
  verifyBundle(
    plan.authorization.bundle,
    plan.authorization.publicKey,
    plan.authorization.origin,
  );
  await authorize(plan.payload);
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  for (const f of plan.files) {
    const current = await transport.read(f.path);
    if ((current === null ? null : sha(current)) !== f.beforeHash)
      throw Error("검토 후 원본이 변경되었습니다: " + f.path);
  }
  const receipt = {
    version: plan.payload.version,
    format: "style-forge-receipt-v1",
    receiptId: plan.id,
    requestId: plan.payload.requestId,
    itemIds: plan.payload.items.map((i) => i.id),
    appliedAt: null,
    files: plan.files.map(({ path, beforeHash, afterHash }) => ({
      path,
      beforeHash,
      afterHash,
    })),
  };
  for (let n = 0; n < plan.files.length; n++) {
    const f = plan.files[n];
    if (f.before !== null)
      await writeFile(resolve(backupDir, n + ".original"), f.before, {
        mode: 0o600,
      });
  }
  await writeFile(
    resolve(backupDir, "plan.json"),
    JSON.stringify(receipt, null, 2),
    { mode: 0o600 },
  );
  const written = [];
  try {
    for (const f of plan.files) {
      const latest = await transport.read(f.path);
      if ((latest === null ? null : sha(latest)) !== f.beforeHash)
        throw Error("파일 쓰기 직전 원본이 변경되었습니다: " + f.path);
      written.push(f);
      await transport.write(f.path, f.after);
      const read = await transport.read(f.path);
      if (!read || sha(read) !== f.afterHash)
        throw Error("업로드 후 해시가 일치하지 않습니다: " + f.path);
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const f of [...written].reverse()) {
      try {
        const current = await transport.read(f.path),
          hash = current === null ? null : sha(current);
        if (hash === f.beforeHash) continue;
        if (hash !== f.afterHash) throw Error("적용 중 외부 변경 확인 필요");
        if (f.before === null) await transport.remove(f.path);
        else await transport.write(f.path, f.before);
      } catch {
        rollbackErrors.push(f.path);
      }
    }
    if (rollbackErrors.length)
      throw Error(
        "일부 복원이 실패했습니다. 백업과 대상 파일을 확인하세요: " +
          rollbackErrors.join(", "),
      );
    throw error;
  }
  receipt.appliedAt = new Date().toISOString();
  await writeFile(
    resolve(backupDir, "receipt.json"),
    JSON.stringify(receipt, null, 2),
    { mode: 0o600 },
  );
  return receipt;
}
export async function rollback(transport, backupDir) {
  const receipt = JSON.parse(
    await readFile(resolve(backupDir, "receipt.json"), "utf8"),
  );
  if (receipt.format !== "style-forge-receipt-v1")
    throw Error("지원되지 않는 영수증");
  for (const f of receipt.files) {
    pathSafe(f.path);
    const current = await transport.read(f.path);
    if (!current || sha(current) !== f.afterHash)
      throw Error(
        "적용 이후 원격 파일이 변경되었습니다. 자동 복원하지 않습니다: " +
          f.path,
      );
  }
  for (let n = receipt.files.length - 1; n >= 0; n--) {
    const f = receipt.files[n];
    if (f.beforeHash === null) await transport.remove(f.path);
    else {
      const before = await readFile(resolve(backupDir, n + ".original"));
      if (sha(before) !== f.beforeHash) throw Error("백업 해시 오류");
      await transport.write(f.path, before);
    }
  }
  return { ok: true };
}
