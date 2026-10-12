import { createServer } from "node:http";
import { randomBytes, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
const digest = (t) => createHash("sha256").update(t).digest("hex");
export function createApp(
  store,
  {
    origins = [],
    staticRoot = resolve(fileURLToPath(new URL("..", import.meta.url))),
  } = {},
) {
  const sessions = new Map(),
    attempts = new Map();
  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json;charset=utf-8",
      });
      res.end(JSON.stringify(data));
    };
    try {
      if (origin) {
        if (
          !origins.includes(origin) &&
          origin !== `http://${req.headers.host}` &&
          origin !== `https://${req.headers.host}`
        )
          return send(403, { error: "허용되지 않은 접속 출처입니다." });
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Authorization, Content-Type",
        );
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      }
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
      const url = new URL(req.url, "http://localhost");
      if (!url.pathname.startsWith("/api/")) {
        if (req.method !== "GET")
          return send(405, { error: "지원하지 않는 요청" });
        let path =
          url.pathname === "/"
            ? "index.html"
            : decodeURIComponent(url.pathname.slice(1));
        if (
          !/^(index\.html|style\.css|app\.js|(?:analyzer|visual|vendor|collaboration|extension|connector)\/[\w./-]+)$/.test(
            path,
          ) ||
          path.split("/").includes("..") ||
          ![".html", ".js", ".css", ".zip", ".svg"].includes(extname(path))
        )
          return send(404, { error: "파일 없음" });
        const content = await readFile(resolve(staticRoot, path));
        res.writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html;charset=utf-8",
              ".js": "text/javascript",
              ".css": "text/css",
              ".zip": "application/zip",
            }[extname(path)] || "application/octet-stream",
        });
        res.end(content);
        return;
      }
      let body = {};
      if (req.method === "POST") {
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return send(415, { error: "JSON 요청만 허용합니다." });
        let chunks = [],
          length = 0;
        for await (const c of req) {
          length += c.length;
          if (length > 2 * 1024 * 1024)
            throw Object.assign(Error("요청은 2 MB 이하여야 합니다."), {
              status: 413,
            });
          chunks.push(c);
        }
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          throw Error("JSON 형식을 확인하세요.");
        }
      }
      if (url.pathname === "/api/login" && req.method === "POST") {
        const key =
          req.socket.remoteAddress + "|" + String(body.email).toLowerCase();
        const bucket = attempts.get(key) || {
          count: 0,
          until: Date.now() + 15 * 60000,
        };
        if (bucket.until < Date.now()) {
          bucket.count = 0;
          bucket.until = Date.now() + 15 * 60000;
        }
        if (bucket.count >= 10)
          return send(429, {
            error: "로그인 시도가 많습니다. 잠시 후 시도하세요.",
          });
        const user = store.login(body.email, body.password);
        if (!user) {
          bucket.count++;
          attempts.set(key, bucket);
          return send(401, { error: "이메일 또는 비밀번호를 확인하세요." });
        }
        attempts.delete(key);
        const token = randomBytes(32).toString("base64url");
        sessions.set(digest(token), {
          user,
          expires: Date.now() + 8 * 3600000,
        });
        return send(200, { token, user });
      }
      const token = req.headers.authorization?.replace(/^Bearer /, ""),
        session = token && sessions.get(digest(token));
      if (!session || session.expires < Date.now())
        return send(401, { error: "로그인이 필요합니다." });
      const user = session.user;
      if (req.method === "GET" && url.pathname === "/api/key") {
        if (user.role !== "reviewer")
          return send(403, { error: "담당자 권한이 필요합니다." });
        return send(200, { publicKey: store.data.keys.publicKey });
      }
      if (req.method === "GET" && url.pathname === "/api/me")
        return send(200, { user });
      if (req.method === "POST" && url.pathname === "/api/logout") {
        sessions.delete(digest(token));
        return send(200, { ok: true });
      }
      if (url.pathname === "/api/users") {
        if (user.role !== "reviewer")
          return send(403, { error: "담당자 권한이 필요합니다." });
        if (req.method === "GET") return send(200, { users: store.users() });
        if (req.method === "POST")
          return send(201, { user: await store.addUser(body) });
      }
      if (url.pathname === "/api/projects") {
        if (req.method === "GET")
          return send(200, { projects: store.projects(user) });
        if (req.method === "POST")
          return send(201, { project: await store.addProject(user, body) });
      }
      if (url.pathname === "/api/requests") {
        if (req.method === "GET")
          return send(200, { requests: store.requests(user) });
        if (req.method === "POST")
          return send(201, { request: await store.submit(user, body) });
      }
      const match =
        /^\/api\/requests\/([\w-]+)(?:\/(decisions|bundle|receipt))?$/.exec(
          url.pathname,
        );
      if (match) {
        const [, id, action] = match;
        if (req.method === "GET" && !action)
          return send(200, { request: store.request(user, id) });
        if (req.method === "POST" && action === "decisions")
          return send(200, { request: await store.decide(user, id, body) });
        if (req.method === "POST" && action === "bundle")
          return send(200, { bundle: store.bundle(user, id, body.challenge) });
        if (req.method === "POST" && action === "receipt")
          return send(200, { request: await store.receipt(user, id, body) });
      }
      return send(404, { error: "API를 찾을 수 없습니다." });
    } catch (e) {
      if (e.code === "ENOENT")
        return send(404, { error: "파일을 찾을 수 없습니다." });
      send(e.status || 400, { error: e.message || "처리하지 못했습니다." });
    }
  });
}
