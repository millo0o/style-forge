import {
  STATES,
  validateItems,
  pageURL,
  itemCSS,
  requestSummary,
} from "./schema.js";
const $ = (id) => document.getElementById(id),
  node = (tag, value = "", cls = "") => {
    const n = document.createElement(tag);
    n.textContent = value;
    n.className = cls;
    return n;
  };
let token = "",
  user = null,
  projects = [],
  requests = [],
  users = [],
  selected = null,
  draft = [];
let mode = "demo";
try {
  $("collab-api").value = localStorage.getItem("style-forge.collab.api") || "";
} catch {}
let demoMemory = null;
const demoKey = "style-forge.collab.demo.v1";
const demoOrigin =
  location.protocol === "chrome-extension:"
    ? "https://demo.example"
    : location.origin;
const demoClient = {
    id: "demo-client",
    name: "체험 클라이언트",
    email: "client@example.test",
    role: "client",
  },
  demoReviewer = { id: "demo-reviewer", name: "체험 담당자", role: "reviewer" };
function demo() {
  let d;
  try {
    d = JSON.parse(localStorage.getItem(demoKey) || "null");
  } catch {}
  if (!d) d = demoMemory;
  if (!d) {
    const page = demoOrigin + "/visual/demo.html";
    d = {
      projects: [
        {
          id: "demo-project",
          name: "쇼핑몰 체험 프로젝트",
          origin: demoOrigin,
        },
      ],
      requests: [
        {
          id: "demo-request",
          version: 1,
          projectId: "demo-project",
          authorId: demoClient.id,
          authorName: demoClient.name,
          title: "메인 글씨와 버튼 여백 수정",
          note: "제목을 더 크게 하고 상품 버튼 여백을 늘려주세요.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            {
              id: "demo-title",
              pageUrl: page,
              selector: ".shop-title",
              media: "all",
              properties: { "font-size": "42px", color: "#9258ad" },
              before: { "font-size": "38px", color: "rgb(37, 40, 50)" },
              label: "메인 제목",
              important: true,
              sources: [],
              status: "pending",
            },
            {
              id: "demo-button",
              pageUrl: page,
              selector: ".product-button",
              media: "all",
              properties: { "padding-top": "18px", "border-radius": "14px" },
              before: { "padding-top": "12px", "border-radius": "8px" },
              label: "상품 버튼",
              important: true,
              sources: [],
              status: "pending",
            },
          ],
          events: [],
        },
      ],
    };
    try {
      localStorage.setItem(demoKey, JSON.stringify(d));
    } catch {}
  }
  demoMemory = d;
  return d;
}
function say(message) {
  $("collab-status").textContent = message;
}
function baseURL() {
  const value = $("collab-api").value.trim().replace(/\/$/, "");
  const u = new URL(value);
  if (
    u.username ||
    u.password ||
    u.pathname !== "/" ||
    (!["https:"].includes(u.protocol) &&
      !(
        u.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(u.hostname)
      ))
  )
    throw Error("HTTPS 서버 주소 또는 localhost 주소를 입력하세요.");
  return u.origin;
}
async function api(path, body) {
  const res = await fetch(baseURL() + path, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "요청 실패");
  return data;
}
function saveDemo(d) {
  demoMemory = d;
  try {
    localStorage.setItem(demoKey, JSON.stringify(d));
  } catch {}
}
function download(value, name, type = "application/json") {
  const a = node("a"),
    url = URL.createObjectURL(new Blob([value], { type }));
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function refresh() {
  try {
    if (mode === "demo") {
      user =
        $("collab-demo-role").value === "client" ? demoClient : demoReviewer;
      const d = demo();
      projects = d.projects;
      requests = d.requests
        .filter((r) => user.role === "reviewer" || r.authorId === user.id)
        .map(requestSummary);
    } else {
      if (!token) {
        user = null;
        projects = [];
        requests = [];
        render();
        return;
      }
      projects = (await api("/api/projects")).projects;
      requests = (await api("/api/requests")).requests;
      if (user.role === "reviewer") users = (await api("/api/users")).users;
    }
    render();
  } catch (e) {
    say(e.message);
  }
}
function render() {
  const logged = !!user;
  $("collab-body").hidden = !logged;
  $("collab-login").hidden = mode !== "server" || logged;
  $("collab-demo-role-wrap").hidden = mode !== "demo";
  $("collab-logout").hidden = mode !== "server" || !logged;
  $("collab-user").textContent = user
    ? `${user.name} · ${user.role === "reviewer" ? "담당자" : "클라이언트"}`
    : "로그인 후 사용하세요.";
  $("collab-mode-banner").textContent =
    mode === "demo"
      ? "로컬 체험 모드 · 이 브라우저에만 저장됩니다. 클라이언트에게 실제 전송하지 않습니다."
      : "협업 서버 모드 · 수정 요청과 검토 기록을 연결한 서버에 저장합니다.";
  const previous = $("collab-project").value;
  $("collab-project").replaceChildren(
    ...projects.map((p) => new Option(p.name, p.id)),
  );
  if (projects.some((p) => p.id === previous))
    $("collab-project").value = previous;
  $("collab-submit-section").hidden = user?.role !== "client";
  $("collab-admin").hidden = user?.role !== "reviewer" || mode === "demo";
  $("collab-client-users").replaceChildren(
    ...users
      .filter((u) => u.role === "client")
      .map((u) => new Option(u.name + " · " + u.email, u.id)),
  );
  updateList();
  if (selected) {
    const current = requests.find((r) => r.id === selected.id);
    if (current) showRequest(current);
    else {
      $("collab-detail").replaceChildren(
        node("p", "수정 요청을 선택하세요.", "collab-empty"),
      );
      selected = null;
    }
  }
}
function updateList() {
  const search = $("collab-search").value.toLowerCase(),
    filter = $("collab-filter").value,
    list = requests.filter(
      (r) =>
        r.projectId === $("collab-project").value &&
        (filter === "all" || r.items.some((i) => i.status === filter)) &&
        [r.title, ...r.pages].join(" ").toLowerCase().includes(search),
    );
  $("collab-request-count").textContent = list.length + "건";
  $("collab-requests").replaceChildren(
    ...list.map((r) => {
      const b = node(
        "button",
        "",
        selected?.id === r.id ? "collab-request selected" : "collab-request",
      );
      b.append(
        node("strong", r.title),
        node(
          "small",
          `${r.authorName} · ${r.pages.length}개 페이지 · ${r.items.length}개 영역`,
        ),
        node("p", r.pages.join("\n")),
        node("small", `검토 대기 ${r.pending} · 승인 ${r.approved}`),
      );
      b.addEventListener("click", () => showRequest(r));
      return b;
    }),
  );
  if (!list.length)
    $("collab-requests").append(
      node("p", "수정 요청이 없습니다.", "collab-empty"),
    );
}
function reviewPacket(r) {
  return {
    format: "style-forge-review-v1",
    requestId: r.id,
    version: r.version,
    title: r.title,
    items: r.items.filter((i) => i.status !== "rejected"),
  };
}
async function decide(r, item, status, note) {
  try {
    if (mode === "demo") {
      const d = demo(),
        req = d.requests.find((q) => q.id === r.id);
      req.items.find((i) => i.id === item.id).status = status;
      req.items.find((i) => i.id === item.id).reviewNote = note;
      req.version++;
      saveDemo(d);
    } else
      await api("/api/requests/" + r.id + "/decisions", {
        version: r.version,
        decisions: [{ id: item.id, status, note }],
      });
    await refresh();
    say("검토 결과를 저장했습니다.");
  } catch (e) {
    say(e.message);
  }
}
function showRequest(r) {
  selected = r;
  updateList();
  const root = $("collab-detail");
  root.replaceChildren(
    node("h2", r.title),
    node(
      "p",
      `${r.authorName} · ${new Date(r.createdAt).toLocaleString("ko-KR")} · 버전 ${r.version}`,
      "meta",
    ),
    node("p", r.note || "메모 없음", "meta"),
  );
  const actions = node("div", "", "collab-actions");
  const show = node("button", "홈페이지 표시 JSON", "button");
  show.addEventListener("click", () =>
    download(
      JSON.stringify(reviewPacket(r), null, 2),
      "style-forge-review.json",
    ),
  );
  actions.append(show);
  if (user.role === "reviewer") {
    const bundle = node(
      "button",
      mode === "demo" ? "승인 CSS 받기 (체험)" : "승인 적용 패키지 받기",
      "button dark",
    );
    bundle.disabled = !r.items.some((i) => i.status === "approved");
    bundle.addEventListener("click", async () => {
      try {
        if (mode === "demo")
          download(
            r.items
              .filter((i) => i.status === "approved")
              .map(itemCSS)
              .join("\n"),
            "approved-demo.css",
            "text/css",
          );
        else {
          const data = await api("/api/requests/" + r.id + "/bundle", {});
          download(
            JSON.stringify(data.bundle, null, 2),
            "style-forge-approved.json",
          );
        }
      } catch (e) {
        say(e.message);
      }
    });
    actions.append(bundle);
    const receiptLabel = node("label", "적용 영수증 확인", "collab-file"),
      receipt = node("input");
    receipt.type = "file";
    receipt.accept = ".json";
    receiptLabel.append(receipt);
    receipt.addEventListener("change", async () => {
      try {
        if (mode !== "server")
          throw Error("체험 모드에서는 실제 적용 완료를 기록하지 않습니다.");
        const file = receipt.files[0];
        if (!file || file.size > 100000)
          throw Error("영수증 파일을 확인하세요.");
        const data = JSON.parse(await file.text());
        if (data.requestId !== r.id) throw Error("다른 요청의 영수증입니다.");
        await api("/api/requests/" + r.id + "/receipt", data);
        await refresh();
        say("담당자가 적용 영수증을 확인하여 기록했습니다.");
      } catch (e) {
        say(e.message);
      }
      receipt.value = "";
    });
    actions.append(receiptLabel);
  }
  root.append(actions);
  if (mode === "demo" && location.protocol !== "chrome-extension:") {
    const preview = node("button", "수정 영역 체험 화면 열기", "button");
    preview.addEventListener("click", async () => {
      const existing = root.querySelector("iframe");
      existing?.remove();
      const iframe = node("iframe", "", "collab-demo-frame");
      iframe.title = "수정 영역 검토 체험";
      iframe.src = "visual/demo.html";
      root.append(iframe);
      iframe.scrollIntoView({ block: "start" });
      iframe.addEventListener("load", async () => {
        const { mountEditor } = await import("../vendor/visual-editor.js");
        mountEditor(iframe.contentDocument, { reviewPacket: reviewPacket(r) });
      });
    });
    root.append(preview);
  }
  for (const item of r.items) {
    const card = node("article", "", "collab-item");
    card.append(
      node("strong", item.label),
      node("span", STATES[item.status], "badge"),
    );
    const link = node("a", item.pageUrl, "page-link");
    link.href = pageURL(item.pageUrl);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.append(link, node("code", item.selector + " · " + item.media));
    const table = node("table"),
      head = node("tr");
    for (const title of ["속성", "수정 전 대표값", "수정 후"])
      head.append(node("th", title));
    table.append(head);
    for (const [property, value] of Object.entries(item.properties)) {
      const row = node("tr");
      row.append(
        node("td", property),
        node("td", item.before?.[property] || "미기록"),
        node("td", value),
      );
      table.append(row);
    }
    card.append(table);
    for (const s of item.sources || [])
      card.append(
        node("div", `${s.file}:${s.line} · 파일 위치 후보`, "collab-source"),
      );
    if (item.reviewNote) card.append(node("p", item.reviewNote, "meta"));
    if (user.role === "reviewer" && item.status !== "applied") {
      const controls = node("div", "", "collab-review-controls"),
        status = node("select");
      for (const [value, title] of [
        ["approved", "승인"],
        ["revision_requested", "재수정 요청"],
        ["rejected", "반려"],
      ])
        status.append(new Option(title, value));
      status.value = item.status === "pending" ? "approved" : item.status;
      const note = node("input");
      note.placeholder = "검토 메모 / 재수정 사유";
      note.value = item.reviewNote || "";
      const save = node("button", "검토 저장", "button");
      save.addEventListener("click", () => {
        if (status.value === "revision_requested" && !note.value.trim()) {
          say("재수정 사유를 입력하세요.");
          return;
        }
        decide(r, item, status.value, note.value);
      });
      controls.append(status, note, save);
      card.append(controls);
    }
    root.append(card);
  }
  if (
    user.role === "client" &&
    r.items.some((i) => i.status === "revision_requested")
  ) {
    const resubmit = node("button", "재수정 요청에 답하기", "button");
    resubmit.addEventListener("click", () => {
      $("collab-supersedes").value = r.id;
      $("collab-title").value = "[재수정] " + r.title;
      say(
        "새 수정 요청 파일을 불러와 제출하세요. 이전 검토 기록은 유지됩니다.",
      );
      $("collab-submit-section").scrollIntoView({ behavior: "smooth" });
    });
    root.append(resubmit);
  }
}
$("collab-mode").addEventListener("change", () => {
  mode = $("collab-mode").value;
  token = "";
  user = null;
  selected = null;
  refresh();
});
$("collab-demo-role").addEventListener("change", () => {
  selected = null;
  refresh();
});
$("collab-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    if (globalThis.chrome?.permissions) {
      const origin = new URL(baseURL());
      const ok = await chrome.permissions.request({
        origins: [origin.protocol + "//" + origin.hostname + "/*"],
      });
      if (!ok) throw Error("서버 접근 권한이 필요합니다.");
    }
    const data = await api("/api/login", {
      email: $("collab-email").value,
      password: $("collab-password").value,
    });
    $("collab-password").value = "";
    try {
      localStorage.setItem("style-forge.collab.api", baseURL());
    } catch {}
    token = data.token;
    user = data.user;
    await refresh();
    say("로그인했습니다.");
  } catch (error) {
    say(error.message);
  }
});
$("collab-logout").addEventListener("click", async () => {
  try {
    await api("/api/logout", {});
  } catch {}
  token = "";
  user = null;
  selected = null;
  refresh();
});
$("collab-refresh").addEventListener("click", refresh);
for (const id of ["collab-project", "collab-filter"])
  $(id).addEventListener("change", () => {
    selected = null;
    updateList();
    $("collab-detail").replaceChildren(
      node("p", "수정 요청을 선택하세요.", "collab-empty"),
    );
  });
$("collab-search").addEventListener("input", updateList);
$("collab-submit-files").addEventListener("change", async (e) => {
  try {
    const items = [];
    for (const file of e.target.files) {
      if (file.size > 2 * 1024 * 1024)
        throw Error("요청 파일은 2 MB 이하여야 합니다.");
      const data = JSON.parse(await file.text());
      if (data.format !== "style-forge-submission-v1")
        throw Error("비주얼 편집기의 검토 요청 파일을 선택하세요.");
      items.push(...data.items);
    }
    draft = items;
    $("collab-draft-info").textContent =
      `${new Set(items.map((i) => i.pageUrl)).size}개 페이지 · ${items.length}개 수정 영역 준비됨`;
  } catch (error) {
    say(error.message);
  }
  e.target.value = "";
});
$("collab-submit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const project = projects.find((p) => p.id === $("collab-project").value);
    if (!project) throw Error("프로젝트를 먼저 선택하세요.");
    const items = validateItems(draft, project.origin, (p, v) =>
      CSS.supports(p, v),
    );
    const body = {
      projectId: project.id,
      title: $("collab-title").value,
      note: $("collab-note").value,
      supersedes: $("collab-supersedes").value || null,
      items,
    };
    if (mode === "demo") {
      const d = demo(),
        now = new Date().toISOString();
      d.requests.push({
        ...body,
        id: crypto.randomUUID(),
        authorId: user.id,
        authorName: user.name,
        version: 1,
        createdAt: now,
        updatedAt: now,
        events: [],
        items: items.map((i) => ({
          ...i,
          id: crypto.randomUUID(),
          status: "pending",
        })),
      });
      saveDemo(d);
    } else await api("/api/requests", body);
    draft = [];
    $("collab-draft-info").textContent = "";
    $("collab-submit-form").reset();
    await refresh();
    say(
      mode === "demo"
        ? "체험 수정 요청을 이 브라우저에 저장했습니다."
        : "담당자 검토함에 수정 요청을 제출했습니다.",
    );
  } catch (error) {
    say(error.message);
  }
});
$("collab-new-user").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/users", {
      email: $("collab-new-email").value,
      name: $("collab-new-name").value,
      password: $("collab-new-password").value,
      role: "client",
    });
    $("collab-new-password").value = "";
    e.target.reset();
    await refresh();
    say("클라이언트 계정을 생성했습니다.");
  } catch (error) {
    say(error.message);
  }
});
$("collab-new-project").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/projects", {
      name: $("collab-new-project-name").value,
      origin: $("collab-new-origin").value,
      clientIds: [...$("collab-client-users").selectedOptions].map(
        (o) => o.value,
      ),
    });
    e.target.reset();
    await refresh();
    say("프로젝트를 생성했습니다.");
  } catch (error) {
    say(error.message);
  }
});
$("collab-export-key").addEventListener("click", async () => {
  try {
    const data = await api("/api/key");
    download(data.publicKey, "style-forge-server-public.pem", "text/plain");
  } catch (error) {
    say(error.message);
  }
});
if (location.protocol === "chrome-extension:") {
  const key = new URL(location.href).searchParams.get("draft");
  if (key) {
    const saved = (await chrome.storage.session.get(key))[key];
    if (saved) {
      draft = saved.items;
      $("collab-draft-info").textContent = `${draft.length}개 수정 영역 준비됨`;
    }
    await chrome.storage.session.remove(key);
  }
  $("collab-mode").value = "server";
  mode = "server";
}
refresh();
