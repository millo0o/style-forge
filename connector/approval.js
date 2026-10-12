import { randomUUID } from "node:crypto";
import { verifyBundle } from "./deploy.js";
export async function checkApproval(
  server,
  email,
  password,
  payload,
  publicKey,
) {
  const url = new URL(server);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw Error("협업 서버는 HTTPS 또는 localhost 주소여야 합니다.");
  const response = await fetch(url.origin + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000),
    }),
    login = await response.json();
  if (!response.ok || !login.token) throw Error("담당자 로그인을 확인하세요.");
  try {
    if (login.user?.role !== "reviewer")
      throw Error("담당자 권한이 필요합니다.");
    const challenge = randomUUID(),
      res = await fetch(
        url.origin + "/api/requests/" + payload.requestId + "/bundle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + login.token,
          },
          body: JSON.stringify({ challenge }),
          signal: AbortSignal.timeout(15000),
        },
      ),
      data = await res.json();
    if (!res.ok) throw Error("승인 상태를 확인하세요. 새 패키지가 필요합니다.");
    const fresh = verifyBundle(data.bundle, publicKey, payload.origin);
    if (
      fresh.challenge !== challenge ||
      fresh.version !== payload.version ||
      fresh.projectId !== payload.projectId ||
      payload.items.some(
        (i) =>
          !fresh.items.some(
            (current) =>
              current.id === i.id &&
              JSON.stringify(current.properties) ===
                JSON.stringify(i.properties) &&
              current.selector === i.selector &&
              current.pageUrl === i.pageUrl,
          ),
      )
    )
      throw Error(
        "승인 상태가 변경되었습니다. 검토함에서 새 패키지를 받으세요.",
      );
    return true;
  } finally {
    await fetch(url.origin + "/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + login.token,
      },
      body: "{}",
      signal: AbortSignal.timeout(15000),
    }).catch(() => {});
  }
}
