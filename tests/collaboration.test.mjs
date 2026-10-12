import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  rm,
  writeFile,
  readFile,
  mkdir,
  symlink,
} from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../server/store.js";
import { createApp } from "../server/app.js";
import {
  LocalTransport,
  FTPTransport,
  verifyBundle,
  prepare,
  apply,
  rollback,
  sha,
} from "../connector/deploy.js";
async function fixture() {
  const dir = await mkdtemp(resolve(tmpdir(), "sf-collab-"));
  const store = await new Store(resolve(dir, "db")).init();
  const reviewer = await store.addUser({
      email: "reviewer@example.test",
      name: "담당자",
      password: "TestOnly!Password123",
      role: "reviewer",
    }),
    client = await store.addUser({
      email: "client@example.test",
      name: "고객",
      password: "TestOnly!Password123",
      role: "client",
    }),
    other = await store.addUser({
      email: "other@example.test",
      name: "다른 고객",
      password: "TestOnly!Password123",
      role: "client",
    });
  const project = await store.addProject(reviewer, {
    name: "쇼핑몰",
    origin: "https://shop.example.test",
    clientIds: [client.id],
  });
  const body = {
    projectId: project.id,
    title: "메인 수정",
    items: [
      {
        pageUrl: project.origin + "/index.html",
        selector: ".title",
        media: "all",
        properties: { "font-size": "42px", color: "#123456" },
        before: { "font-size": "20px" },
        label: "메인 제목",
      },
    ],
  };
  return {
    dir,
    store,
    reviewer,
    client,
    other,
    project,
    body,
    async close() {
      await rm(dir, { recursive: true, force: true });
    },
  };
}
test("client project access and request validation; passwords never returned; persistence", async () => {
  const f = await fixture();
  try {
    assert.equal(f.store.projects(f.other).length, 0);
    await assert.rejects(f.store.submit(f.other, f.body), /권한/);
    await assert.rejects(
      f.store.submit(f.client, {
        ...f.body,
        items: [{ ...f.body.items[0], pageUrl: "https://other.example/path" }],
      }),
      /등록된 사이트/,
    );
    await assert.rejects(
      f.store.submit(f.client, {
        ...f.body,
        items: [
          { ...f.body.items[0], properties: { color: "red;display:none" } },
        ],
      }),
      /허용되지/,
    );
    const r = await f.store.submit(f.client, f.body);
    assert.equal(r.items[0].status, "pending");
    assert(!Object.hasOwn(f.store.users()[0], "passwordHash"));
    const restored = await new Store(resolve(f.dir, "db")).init();
    assert.equal(restored.requests(f.client)[0].id, r.id);
    assert(f.store.login("client@example.test", "TestOnly!Password123"));
    assert.equal(f.store.login("client@example.test", "wrong"), null);
  } finally {
    await f.close();
  }
});
test("reviewer-only decisions, optimistic conflicts, revision linkage, signed approved-only bundle", async () => {
  const f = await fixture();
  try {
    let r = await f.store.submit(f.client, f.body);
    await assert.rejects(
      f.store.decide(f.client, r.id, {
        version: 1,
        decisions: [{ id: r.items[0].id, status: "approved" }],
      }),
      /담당자/,
    );
    r = await f.store.decide(f.reviewer, r.id, {
      version: 1,
      decisions: [
        {
          id: r.items[0].id,
          status: "revision_requested",
          note: "크기를 조절해주세요",
        },
      ],
    });
    await assert.rejects(
      f.store.decide(f.reviewer, r.id, {
        version: 1,
        decisions: [{ id: r.items[0].id, status: "approved" }],
      }),
      /새로고침/,
    );
    assert.throws(() => f.store.bundle(f.reviewer, r.id), /승인된/);
    const next = await f.store.submit(f.client, {
      ...f.body,
      supersedes: r.id,
    });
    assert.equal(next.supersedes, r.id);
    r = await f.store.decide(f.reviewer, next.id, {
      version: 1,
      decisions: [{ id: next.items[0].id, status: "approved" }],
    });
    const bundle = f.store.bundle(f.reviewer, r.id);
    assert.equal(
      verifyBundle(bundle, f.store.data.keys.publicKey, f.project.origin).items
        .length,
      1,
    );
    bundle.payload.items[0].properties.color = "red";
    assert.throws(
      () => verifyBundle(bundle, f.store.data.keys.publicKey, f.project.origin),
      /서명/,
    );
  } finally {
    await f.close();
  }
});
test("real HTTP login, RBAC, CORS, session logout and private files", async () => {
  const f = await fixture(),
    app = createApp(f.store, { origins: ["https://millo0o.github.io"] });
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + app.address().port;
  const call = async (path, body, token, origin) => {
    const res = await fetch(base + path, {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(origin ? { Origin: origin } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: res.status, data: await res.json() };
  };
  try {
    assert.equal((await call("/api/requests")).status, 401);
    const login = await call("/api/login", {
      email: f.client.email,
      password: "TestOnly!Password123",
    });
    assert.equal(login.status, 200);
    assert.equal(
      (await call("/api/users", null, login.data.token)).status,
      403,
    );
    assert.equal(
      (
        await call(
          "/api/projects",
          { name: "unauthorized", origin: f.project.origin },
          login.data.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (await call("/api/requests", f.body, login.data.token)).status,
      201,
    );
    assert.equal(
      (
        await call(
          "/api/projects",
          null,
          login.data.token,
          "https://evil.example",
        )
      ).status,
      403,
    );
    assert.equal((await call("/.git/config")).status, 404);
    assert.equal((await call("/server/store.js")).status, 404);
    await call("/api/logout", {}, login.data.token);
    assert.equal(
      (await call("/api/requests", null, login.data.token)).status,
      401,
    );
  } finally {
    await new Promise((r) => app.close(r));
    await f.close();
  }
});
async function planFixture() {
  const f = await fixture();
  let r = await f.store.submit(f.client, f.body);
  r = await f.store.decide(f.reviewer, r.id, {
    version: 1,
    decisions: [{ id: r.items[0].id, status: "approved" }],
  });
  const bundle = f.store.bundle(f.reviewer, r.id),
    root = resolve(f.dir, "skin");
  await mkdir(resolve(root, "layout"), { recursive: true });
  await writeFile(
    resolve(root, "layout/main.html"),
    "<html><head><title>원본</title></head><body>원본</body></html>",
  );
  const config = {
    protocol: "local",
    origin: f.project.origin,
    root,
    layoutPath: "layout/main.html",
    layoutMode: "cafe24",
    outputPath: "mill/style-forge",
    publicBase: "/mill/style-forge",
    publicKey: f.store.data.keys.publicKey,
  };
  return { ...f, config, bundle, transport: new LocalTransport(root) };
}
test("approve → prepare read-only → backup/apply page-scoped CSS → receipt → rollback", async () => {
  const f = await planFixture();
  try {
    const original = await f.transport.read(f.config.layoutPath);
    const plan = await prepare(f.transport, f.bundle, f.config);
    assert.equal(await f.transport.read("mill/style-forge/loader.js"), null);
    assert.deepEqual(await f.transport.read(f.config.layoutPath), original);
    const dir = resolve(f.dir, "backup"),
      receipt = await apply(f.transport, plan, dir);
    assert(receipt.appliedAt);
    const layout = (await f.transport.read(f.config.layoutPath)).toString();
    assert.match(layout, /<!--@js\(\/mill\/style-forge\/loader.js\)-->/);
    const loader = (
      await f.transport.read("mill/style-forge/loader.js")
    ).toString();
    assert.match(loader, /page.origin\+page.pathname\+page.search/);
    assert.match(loader, /\/index.html/);
    assert.equal(
      (await f.transport.read(plan.files[0].path))
        .toString()
        .includes("font-size: 42px"),
      true,
    );
    const recorded = await f.store.receipt(
      f.reviewer,
      receipt.requestId,
      receipt,
    );
    assert.equal(recorded.items[0].status, "applied");
    await rollback(f.transport, dir);
    assert.deepEqual(await f.transport.read(f.config.layoutPath), original);
    assert.equal(await f.transport.read("mill/style-forge/loader.js"), null);
  } finally {
    await f.close();
  }
});
test("source hash conflict prevents writes; expired/tampered approval and symbolic paths are rejected", async () => {
  const f = await planFixture();
  try {
    const plan = await prepare(f.transport, f.bundle, f.config);
    await writeFile(
      resolve(f.config.root, "layout/main.html"),
      "concurrent change",
    );
    await assert.rejects(
      apply(f.transport, plan, resolve(f.dir, "backup")),
      /원본이 변경/,
    );
    assert.equal(await f.transport.read(plan.files[0].path), null);
    await symlink("/tmp", resolve(f.config.root, "escape"));
    await assert.rejects(f.transport.read("escape/anything"), /심볼릭/);
    const altered = structuredClone(f.bundle);
    altered.payload.expiresAt = "2000-01-01";
    assert.throws(
      () => verifyBundle(altered, f.config.publicKey, f.config.origin),
      /서명/,
    );
    await assert.rejects(f.transport.read("../outside"), /상대 경로/);
  } finally {
    await f.close();
  }
});
test("failed write verification restores already written files", async () => {
  const f = await planFixture();
  try {
    const plan = await prepare(f.transport, f.bundle, f.config),
      original = await f.transport.read(f.config.layoutPath);
    let calls = 0;
    const transport = {
      read: (p) => f.transport.read(p),
      remove: (p) => f.transport.remove(p),
      write: async (p, b) => {
        if (++calls === 3) throw Error("simulated failure");
        await f.transport.write(p, b);
      },
    };
    await assert.rejects(
      apply(transport, plan, resolve(f.dir, "backup")),
      /simulated failure/,
    );
    assert.deepEqual(await f.transport.read(f.config.layoutPath), original);
    assert.equal(await f.transport.read(plan.files[0].path), null);
  } finally {
    await f.close();
  }
});
test("FTP prepare/read does not create missing directories", async () => {
  const calls = [],
    ftp = new FTPTransport({});
  ftp.base = "/root";
  ftp.client = {
    async cd(p) {
      calls.push(["cd", p]);
    },
    async list() {
      return [];
    },
    async send(command) {
      calls.push(["write", command]);
    },
  };
  assert.equal(await ftp.read("new/folder/file.css"), null);
  assert(!calls.some((c) => c[0] === "write"));
});

import { pageURL } from "../collaboration/schema.js";
test("Cafe24 query pages remain distinct, query order is canonical and credential URLs are rejected", () => {
  assert.notEqual(
    pageURL("https://shop.test/product/detail.html?product_no=1"),
    pageURL("https://shop.test/product/detail.html?product_no=2"),
  );
  assert.equal(
    pageURL("https://shop.test/?b=2&a=1"),
    pageURL("https://shop.test/?a=1&b=2"),
  );
  assert.throws(() => pageURL("https://shop.test/?token=secret"), /인증 정보/);
});

import { checkApproval } from "../connector/approval.js";
test("fresh signed approval is required: clients cannot authorize and revoked approvals fail", async () => {
  const f = await fixture(),
    app = createApp(f.store);
  await new Promise((r) => app.listen(0, "127.0.0.1", r));
  try {
    let request = await f.store.submit(f.client, f.body);
    request = await f.store.decide(f.reviewer, request.id, {
      version: 1,
      decisions: [{ id: request.items[0].id, status: "approved" }],
    });
    const bundle = f.store.bundle(f.reviewer, request.id),
      base = "http://127.0.0.1:" + app.address().port;
    assert(
      await checkApproval(
        base,
        f.reviewer.email,
        "TestOnly!Password123",
        bundle.payload,
        f.store.data.keys.publicKey,
      ),
    );
    await assert.rejects(
      checkApproval(
        base,
        f.client.email,
        "TestOnly!Password123",
        bundle.payload,
        f.store.data.keys.publicKey,
      ),
      /담당자 권한/,
    );
    await f.store.decide(f.reviewer, request.id, {
      version: 2,
      decisions: [{ id: request.items[0].id, status: "rejected" }],
    });
    await assert.rejects(
      checkApproval(
        base,
        f.reviewer.email,
        "TestOnly!Password123",
        bundle.payload,
        f.store.data.keys.publicKey,
      ),
      /승인 상태/,
    );
  } finally {
    await new Promise((r) => app.close(r));
    await f.close();
  }
});
