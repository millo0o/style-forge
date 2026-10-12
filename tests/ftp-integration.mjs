import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { once } from "node:events";
import { Store } from "../server/store.js";
import { FTPTransport, prepare, apply, rollback } from "../connector/deploy.js";
const dir = await mkdtemp(resolve(tmpdir(), "sf-ftp-"));
let child, transport;
try {
  await mkdir(resolve(dir, "skin/layout"), { recursive: true });
  const original =
    "<html><head><title>FTP fixture</title></head><body>fixture</body></html>";
  await writeFile(resolve(dir, "skin/layout/main.html"), original);
  const code = `import sys, logging\nsys.path.insert(0, '/tmp/style-forge-ftp-test')\nfrom pyftpdlib.authorizers import DummyAuthorizer\nfrom pyftpdlib.handlers import FTPHandler\nfrom pyftpdlib.servers import FTPServer\nlogging.disable(logging.CRITICAL)\na=DummyAuthorizer();a.add_user('fixture','TestOnlyPassword',sys.argv[1],perm='elradfmwMT')\nFTPHandler.authorizer=a\ns=FTPServer(('127.0.0.1',0),FTPHandler)\nprint(s.socket.getsockname()[1],flush=True)\ns.serve_forever()\n`;
  child = spawn("python3", ["-c", code, resolve(dir, "skin")], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  let port = await new Promise((r, j) => {
    child.stdout.once("data", (c) => r(Number(c.toString().trim())));
    child.once("exit", () =>
      j(
        Error(
          "FTP fixture did not start; install pyftpdlib in /tmp/style-forge-ftp-test",
        ),
      ),
    );
  });
  const store = await new Store(resolve(dir, "db")).init();
  const reviewer = await store.addUser({
      email: "review@example.test",
      name: "review",
      password: "TestOnlyPassword12",
      role: "reviewer",
    }),
    client = await store.addUser({
      email: "client@example.test",
      name: "client",
      password: "TestOnlyPassword12",
      role: "client",
    });
  const project = await store.addProject(reviewer, {
    name: "fixture",
    origin: "https://shop.example.test",
    clientIds: [client.id],
  });
  let request = await store.submit(client, {
    projectId: project.id,
    title: "FTP apply",
    items: [
      {
        pageUrl: project.origin + "/",
        selector: "#title",
        media: "all",
        properties: { color: "#ff0000" },
        before: { color: "#000000" },
      },
    ],
  });
  request = await store.decide(reviewer, request.id, {
    version: 1,
    decisions: [{ id: request.items[0].id, status: "approved" }],
  });
  const config = {
    host: "127.0.0.1",
    port,
    protocol: "ftp",
    allowPlainFTP: true,
    user: "fixture",
    root: "/",
    origin: project.origin,
    layoutPath: "layout/main.html",
    publicKey: store.data.keys.publicKey,
  };
  transport = new FTPTransport(config);
  await transport.connect("TestOnlyPassword");
  const plan = await prepare(
    transport,
    store.bundle(reviewer, request.id),
    config,
  );
  await assert.rejects(
    readFile(resolve(dir, "skin/mill/style-forge/loader.js")),
    (e) => e.code === "ENOENT",
  );
  await apply(transport, plan, resolve(dir, "backup"));
  assert.match(
    (await readFile(resolve(dir, "skin/layout/main.html"))).toString(),
    /style-forge\/loader.js/,
  );
  assert.equal(
    (await transport.read(plan.files[0].path))
      .toString()
      .includes("color: #ff0000"),
    true,
  );
  await rollback(transport, resolve(dir, "backup"));
  assert.equal(
    (await readFile(resolve(dir, "skin/layout/main.html"))).toString(),
    original,
  );
  console.log(
    "PASS: real loopback FTP login/list/read-only prepare/upload/rename/hash verification/backup/rollback. No production FTP connection.",
  );
} finally {
  await transport?.close();
  if (child) {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
  }
  await rm(dir, { recursive: true, force: true });
}
