import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  generateKeyPairSync,
  sign,
  createHash,
} from "node:crypto";
import { resolve } from "node:path";
import * as cssTree from "css-tree";
import {
  validateItems,
  requestSummary,
  pageURL,
} from "../collaboration/schema.js";
const passwordHash = (password, salt) =>
  scryptSync(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
const publicUser = ({ passwordHash, salt, ...user }) => user;
export class Store {
  constructor(dir) {
    this.dir = resolve(dir);
    this.queue = Promise.resolve();
  }
  async init() {
    await mkdir(this.dir, { recursive: true, mode: 0o700 });
    try {
      this.data = JSON.parse(
        await readFile(resolve(this.dir, "database.json"), "utf8"),
      );
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      const keys = generateKeyPairSync("ed25519", {
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
        publicKeyEncoding: { type: "spki", format: "pem" },
      });
      this.data = { users: [], projects: [], requests: [], receipts: [], keys };
      await this.persist();
    }
    return this;
  }
  async persist() {
    const path = resolve(this.dir, "database.json"),
      tmp = path + ".tmp";
    const encoded = JSON.stringify(this.data);
    if (Buffer.byteLength(encoded) > 50 * 1024 * 1024)
      throw Error(
        "협업 데이터가 50 MB를 초과했습니다. 보관 정책을 정리하세요.",
      );
    await writeFile(tmp, encoded, { mode: 0o600 });
    await rename(tmp, path);
  }
  async transaction(fn) {
    const run = this.queue.then(async () => {
      const backup = structuredClone(this.data);
      try {
        const result = await fn();
        await this.persist();
        return result;
      } catch (e) {
        this.data = backup;
        throw e;
      }
    });
    this.queue = run.catch(() => {});
    return run;
  }
  async addUser({ email, name, password, role = "client" }) {
    return this.transaction(() => {
      email = String(email).trim().toLowerCase();
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !["client", "reviewer"].includes(role) ||
        typeof password !== "string" ||
        password.length < 12 ||
        password.length > 128
      )
        throw Error("이메일·역할과 12–128자 비밀번호를 확인하세요.");
      if (this.data.users.some((u) => u.email === email))
        throw Error("이미 등록된 이메일입니다.");
      const salt = randomBytes(16).toString("hex");
      const user = {
        id: randomUUID(),
        email,
        name: String(name || email).slice(0, 80),
        role,
        salt,
        passwordHash: passwordHash(password, salt).toString("hex"),
      };
      this.data.users.push(user);
      return publicUser(user);
    });
  }
  login(email, password) {
    const user = this.data.users.find(
      (u) => u.email === String(email).toLowerCase().trim(),
    );
    if (typeof password !== "string" || password.length > 128 || !user)
      return null;
    return timingSafeEqual(
      passwordHash(password, user.salt),
      Buffer.from(user.passwordHash, "hex"),
    )
      ? publicUser(user)
      : null;
  }
  users() {
    return this.data.users.map(publicUser);
  }
  visible(user, project) {
    return user.role === "reviewer" || project.clientIds.includes(user.id);
  }
  projects(user) {
    return this.data.projects.filter((p) => this.visible(user, p));
  }
  project(user, id) {
    const p = this.data.projects.find((p) => p.id === id);
    if (!p || !this.visible(user, p))
      throw Object.assign(Error("프로젝트 접근 권한이 없습니다."), {
        status: 403,
      });
    return p;
  }
  async addProject(user, { name, origin, clientIds = [] }) {
    if (user.role !== "reviewer")
      throw Object.assign(Error("담당자만 프로젝트를 생성할 수 있습니다."), {
        status: 403,
      });
    return this.transaction(() => {
      origin = new URL(pageURL(origin)).origin;
      if (
        !String(name).trim() ||
        clientIds.some(
          (id) =>
            !this.data.users.some((u) => u.id === id && u.role === "client"),
        )
      )
        throw Error("프로젝트 이름과 클라이언트를 확인하세요.");
      const p = {
        id: randomUUID(),
        name: String(name).slice(0, 100),
        origin,
        clientIds: [...new Set(clientIds)],
      };
      this.data.projects.push(p);
      return p;
    });
  }
  requests(user) {
    return this.data.requests
      .filter((r) => {
        const p = this.data.projects.find((p) => p.id === r.projectId);
        return (
          p &&
          this.visible(user, p) &&
          (user.role === "reviewer" || r.authorId === user.id)
        );
      })
      .map(requestSummary);
  }
  request(user, id) {
    const r = this.requests(user).find((r) => r.id === id);
    if (!r)
      throw Object.assign(Error("수정 요청 접근 권한이 없습니다."), {
        status: 403,
      });
    return r;
  }
  async submit(user, body) {
    if (user.role !== "client")
      throw Object.assign(Error("클라이언트 계정으로 수정안을 제출하세요."), {
        status: 403,
      });
    const p = this.project(user, body.projectId);
    const check = (name, value) =>
      !cssTree.lexer.matchProperty(
        name,
        cssTree.parse(value, { context: "value" }),
      ).error;
    const items = validateItems(body.items, p.origin, check);
    for (const item of items)
      cssTree.parse(item.selector, { context: "selector" });
    if (!String(body.title || "").trim())
      throw Error("수정 요청 제목을 입력하세요.");
    return this.transaction(() => {
      if (body.supersedes) {
        const prev = this.request(user, body.supersedes);
        if (
          prev.projectId !== p.id ||
          !prev.items.some((i) => i.status === "revision_requested")
        )
          throw Error("재수정 가능한 요청이 아닙니다.");
      }
      const now = new Date().toISOString();
      const r = {
        id: randomUUID(),
        projectId: p.id,
        authorId: user.id,
        authorName: user.name,
        title: String(body.title).slice(0, 120),
        note: String(body.note || "").slice(0, 3000),
        supersedes: body.supersedes || null,
        version: 1,
        createdAt: now,
        updatedAt: now,
        items: items.map((i) => ({
          ...i,
          id: randomUUID(),
          status: "pending",
          reviewNote: "",
        })),
        events: [{ type: "submitted", actor: user.id, at: now }],
      };
      this.data.requests.push(r);
      return requestSummary(r);
    });
  }
  async decide(user, id, body) {
    if (user.role !== "reviewer")
      throw Object.assign(Error("담당자만 검토할 수 있습니다."), {
        status: 403,
      });
    return this.transaction(() => {
      this.request(user, id);
      const r = this.data.requests.find((r) => r.id === id);
      if (body.version !== r.version)
        throw Object.assign(
          Error("다른 검토가 반영되었습니다. 새로고침하세요."),
          { status: 409 },
        );
      if (!Array.isArray(body.decisions) || !body.decisions.length)
        throw Error("검토 항목을 선택하세요.");
      for (const d of body.decisions) {
        const item = r.items.find((i) => i.id === d.id);
        if (
          !item ||
          item.status === "applied" ||
          !["approved", "rejected", "revision_requested"].includes(d.status)
        )
          throw Error("검토 상태를 확인하세요.");
        if (d.status === "revision_requested" && !String(d.note || "").trim())
          throw Error("수정 요청 사유를 입력하세요.");
        item.status = d.status;
        item.reviewNote = String(d.note || "").slice(0, 1000);
      }
      r.version++;
      r.updatedAt = new Date().toISOString();
      r.events.push({
        type: "reviewed",
        actor: user.id,
        at: r.updatedAt,
        decisions: body.decisions.map((d) => ({ id: d.id, status: d.status })),
      });
      return requestSummary(r);
    });
  }
  bundle(user, id, challenge = null) {
    if (user.role !== "reviewer")
      throw Object.assign(Error("담당자만 승인 파일을 받을 수 있습니다."), {
        status: 403,
      });
    const r = this.request(user, id),
      p = this.project(user, r.projectId),
      items = r.items.filter((i) => i.status === "approved");
    if (!items.length) throw Error("승인된 미적용 항목이 없습니다.");
    const payload = {
      format: "style-forge-approved-v1",
      challenge: typeof challenge === "string" ? challenge.slice(0, 100) : null,
      requestId: r.id,
      version: r.version,
      projectId: p.id,
      origin: p.origin,
      title: r.title,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      items,
    };
    const encoded = JSON.stringify(payload);
    return {
      payload,
      signature: sign(
        null,
        Buffer.from(encoded),
        this.data.keys.privateKey,
      ).toString("base64"),
      publicKey: this.data.keys.publicKey,
      keyFingerprint: createHash("sha256")
        .update(this.data.keys.publicKey)
        .digest("hex"),
    };
  }
  async receipt(user, id, body) {
    if (user.role !== "reviewer")
      throw Object.assign(Error("담당자 권한이 필요합니다."), { status: 403 });
    return this.transaction(() => {
      this.request(user, id);
      const r = this.data.requests.find((r) => r.id === id);
      if (
        body.format !== "style-forge-receipt-v1" ||
        body.version !== r.version ||
        !body.appliedAt ||
        !body.receiptId ||
        !Array.isArray(body.itemIds) ||
        !body.itemIds.length ||
        body.itemIds.some(
          (itemId) =>
            !r.items.some((i) => i.id === itemId && i.status === "approved"),
        )
      )
        throw Error("현재 승인 상태의 적용 영수증을 확인하세요.");
      for (const i of r.items)
        if (body.itemIds.includes(i.id)) i.status = "applied";
      r.version++;
      r.events.push({
        type: "application_reported",
        actor: user.id,
        at: new Date().toISOString(),
        receiptId: String(body.receiptId).slice(0, 100),
      });
      return requestSummary(r);
    });
  }
}
