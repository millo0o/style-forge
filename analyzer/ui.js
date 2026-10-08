const $ = (id) => document.getElementById(id);
let result = null,
  worker = null,
  selectedPath = "",
  search = "",
  kind = "all",
  visible = 100;
const text = (tag, value, className = "") => {
  const el = document.createElement(tag);
  el.textContent = value;
  el.className = className;
  return el;
};
function status(message) {
  $("analysis-status").textContent = message;
}
function openSource(path, line = 1) {
  const file = result?.files.find((f) => f.path === path);
  if (!file) return;
  selectedPath = path;
  $("source-title").textContent = path;
  $("source-meta").textContent =
    `${file.encoding} · ${file.type.toUpperCase()} · ${file.content.split("\n").length} 줄`;
  $("source-lines").replaceChildren();
  const lines = file.content.split("\n");
  const target = Math.max(1, Math.min(Number(line) || 1, lines.length));
  const start = Math.max(0, target - 31),
    end = Math.min(lines.length, target + 70);
  for (let i = start; i < end; i++) {
    const row = text(
      "div",
      "",
      i + 1 === target ? "source-line highlighted" : "source-line",
    );
    row.append(
      text("span", String(i + 1), "source-number"),
      text("span", lines[i] || " ", "source-text"),
    );
    $("source-lines").append(row);
  }
  $("source-range").textContent =
    `${start + 1}–${end} / ${lines.length} 줄 · 전체 소스는 원본 다운로드로 확인`;
  $("source-line-input").max = lines.length;
  $("source-line-input").value = target;
  $("source-lines")
    .querySelector(".highlighted")
    ?.scrollIntoView({ block: "nearest" });
  for (const b of document.querySelectorAll("[data-path]"))
    b.classList.toggle("selected", b.dataset.path === path);
  $("download-source").disabled = false;
}
function sourceButton(label, path, line) {
  const b = text("button", label, "source-link");
  b.type = "button";
  b.addEventListener("click", () => openSource(path, line));
  return b;
}
function updateFiles() {
  const query = $("file-search").value.toLowerCase(),
    type = $("file-type").value;
  const files = result.files.filter(
    (f) =>
      (type === "all" || f.type === type) &&
      f.path.toLowerCase().includes(query),
  );
  $("file-count").textContent = files.length + "개";
  $("file-list").replaceChildren(
    ...files.map((f) => {
      const b = text(
        "button",
        "",
        f.path === selectedPath ? "file-row selected" : "file-row",
      );
      b.dataset.path = f.path;
      b.append(
        text("span", f.type.toUpperCase(), "file-type"),
        text("span", f.path, "file-path"),
      );
      b.title = f.path;
      b.addEventListener("click", () => openSource(f.path));
      return b;
    }),
  );
}
function updateSymbols() {
  const matches = result.symbols.filter((s) =>
    s.key.toLowerCase().includes(search),
  );
  $("symbol-count").textContent = `${matches.length}개 토큰`;
  const tokens = matches.slice(0, 150).map((s) => {
    const b = text(
      "button",
      `${s.key} (${s.occurrences.length})`,
      "symbol-chip",
    );
    b.addEventListener("click", () => {
      $("selector-search").value = s.key;
      search = s.key.toLowerCase();
      visible = 100;
      updateResults();
    });
    return b;
  });
  $("symbol-list").replaceChildren(...tokens);
  if (matches.length > 150)
    $("symbol-list").append(
      text("small", "처음 150개 표시 · 검색으로 범위를 좁히세요."),
    );
}
function updateResults() {
  if (!result) return;
  updateSymbols();
  let records = [];
  if (kind === "all" || kind === "html")
    for (const s of result.symbols)
      for (const o of s.occurrences)
        records.push({
          ...o,
          type: "html",
          label: s.key,
          detail: `<${o.tag}> · HTML 속성 확인`,
          status: "정적 속성",
        });
  if (kind === "all" || kind === "css")
    for (const r of result.rules)
      records.push({
        ...r,
        type: "css",
        label: r.selector,
        detail: `${r.context} · 명시도 참고 ${r.specificity.join(",")} · 분석 순서 ${r.order}${r.important ? " · !important 포함" : ""}${r.duplicateCount > 1 ? " · 중복 " + r.duplicateCount + "개" : ""}`,
        status: r.status,
      });
  if (kind === "all" || kind === "js")
    for (const j of result.javascript)
      records.push({ ...j, type: "js", label: j.selector, detail: j.event });
  if (kind === "all" || kind === "refs")
    for (const r of result.references)
      records.push({ ...r, type: "refs", label: r.target, detail: r.kind });
  records = records.filter((r) =>
    [r.label, r.file, r.detail, r.resolved, ...(r.tokens || [])]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(search)),
  );
  $("result-count").textContent = records.length + "개 결과";
  $("results-list").replaceChildren();
  for (const r of records.slice(0, visible)) {
    const card = text("article", "", "analysis-result");
    const head = text("div", "", "result-heading");
    head.append(
      text("span", r.type.toUpperCase(), "result-type"),
      text("strong", r.label),
      text("span", r.status, "match-status"),
    );
    card.append(
      head,
      sourceButton(`${r.file}:${r.line || 1}`, r.file, r.line),
      text("p", r.detail, "result-detail"),
    );
    if (r.type === "css") {
      if (r.matches.length) {
        const list = text("div", "", "match-links");
        list.append(
          text("span", `${r.matchCount}개 정적 요소 · 실제 적용은 미확인`),
        );
        for (const m of r.matches.slice(0, 8))
          list.append(
            sourceButton(`<${m.tag}> ${m.file}:${m.line || 1}`, m.file, m.line),
          );
        if (r.matches.length > 8) {
          const more = text("details", "");
          more.append(
            text("summary", `표시된 나머지 ${r.matches.length - 8}개 요소`),
          );
          for (const m of r.matches.slice(8))
            more.append(
              sourceButton(
                `<${m.tag}> ${m.file}:${m.line || 1}`,
                m.file,
                m.line,
              ),
            );
          list.append(more);
        }
        card.append(list);
      } else if (r.candidateFiles.length) {
        const details = text("details", "");
        details.append(
          text("summary", "이름 후보 파일 · 구조 일치로 판정하지 않음"),
        );
        for (const f of r.candidateFiles) details.append(sourceButton(f, f, 1));
        card.append(details);
      }
      if (r.declarations?.length)
        card.append(
          text(
            "pre",
            r.declarations
              .map(
                (d) =>
                  `${d.property}: ${d.value}${d.important ? " !important" : ""};`,
              )
              .join("\n"),
            "declaration-preview",
          ),
        );
    }
    if (r.type === "js" && r.candidateCount) {
      const links = text("details", "");
      links.append(
        text(
          "summary",
          `HTML 이름 후보 ${r.candidateCount}개 · 실행 시 대상은 미확인`,
        ),
      );
      for (const c of r.candidates)
        links.append(
          sourceButton(`<${c.tag}> ${c.file}:${c.line}`, c.file, c.line),
        );
      if (r.candidateCount > r.candidates.length)
        links.append(text("small", "처음 50개 후보만 표시합니다."));
      card.append(links);
    }
    if (r.type === "refs") {
      if (r.resolved)
        card.append(sourceButton("→ " + r.resolved, r.resolved, 1));
      else if (r.kind !== "module")
        card.append(
          text("small", "대상이 로컬 파일에 없거나 외부/동적 경로입니다."),
        );
      if (r.candidates?.length > 1)
        for (const path of r.candidates.slice(1))
          card.append(sourceButton("다른 후보 → " + path, path, 1));
    }
    $("results-list").append(card);
  }
  if (!records.length)
    $("results-list").append(
      text(
        "p",
        "일치하는 결과가 없습니다. 다른 선택자 또는 파일 경로를 검색하세요.",
        "empty-note",
      ),
    );
  $("more-results").hidden = records.length <= visible;
  $("more-results").textContent =
    `다음 100개 보기 (${Math.min(visible, records.length)} / ${records.length})`;
}
function showResult(data) {
  result = data;
  search = "";
  kind = "all";
  visible = 100;
  $("selector-search").value = "";
  $("result-kind").value = "all";
  $("analysis-empty").hidden = true;
  $("analysis-content").hidden = false;
  $("analysis-stats").replaceChildren(
    ...Object.entries({
      HTML: data.stats.html,
      CSS: data.stats.css,
      JS: data.stats.js,
      class: data.stats.classes,
      id: data.stats.ids,
      선택자: data.stats.selectors,
    }).map(([key, count]) => {
      const el = text("div", "", "stat");
      el.append(text("strong", count.toLocaleString()), text("span", key));
      return el;
    }),
  );
  $("analysis-warnings").replaceChildren(
    ...data.warnings.map((w) => text("li", w)),
  );
  $("warnings-section").hidden = !data.warnings.length;
  $("export-analysis").disabled = false;
  status(
    `${data.totalFiles}개 파일 중 ${data.files.length}개 소스 분석 완료 · 외부 전송 없음`,
  );
  updateFiles();
  updateResults();
  openSource(
    data.files.find((f) => f.path.endsWith("/index.html"))?.path ||
      data.files[0].path,
  );
}
function start(input) {
  worker?.terminate();
  worker = new Worker(
    new URL("../vendor/analyzer-worker.js", import.meta.url),
    { type: "module" },
  );
  $("cancel-analysis").hidden = false;
  $("folder-input").disabled = true;
  $("archive-input").disabled = true;
  status("분석 준비 중…");
  let finished = false;
  const done = () => {
    finished = true;
    $("cancel-analysis").hidden = true;
    $("folder-input").disabled = false;
    $("archive-input").disabled = false;
    worker?.terminate();
    worker = null;
  };
  worker.onmessage = ({ data }) => {
    if (data.type === "progress") status(data.message);
    else if (data.type === "result") {
      showResult(data.result);
      done();
    } else if (data.type === "error") {
      status("분석 실패: " + data.message);
      done();
    }
  };
  worker.onerror = () => {
    if (!finished) {
      status(
        "분석기를 시작하지 못했습니다. HTTP 서버에서 실행하는지 확인하세요.",
      );
      done();
    }
  };
  worker.postMessage(input);
}
$("folder-input").addEventListener("change", (e) => {
  if (e.target.files.length)
    start({ kind: "folder", files: [...e.target.files] });
  e.target.value = "";
});
$("archive-input").addEventListener("change", (e) => {
  if (e.target.files[0]) start({ kind: "archive", file: e.target.files[0] });
  e.target.value = "";
});
$("cancel-analysis").addEventListener("click", () => {
  worker?.terminate();
  worker = null;
  $("cancel-analysis").hidden = true;
  $("folder-input").disabled = false;
  $("archive-input").disabled = false;
  status("분석을 취소했습니다. 이전 분석 결과는 유지됩니다.");
});
$("file-search").addEventListener("input", () => {
  if (result) updateFiles();
});
$("file-type").addEventListener("change", () => {
  if (result) updateFiles();
});
let debounce;
$("selector-search").addEventListener("input", () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    search = $("selector-search").value.trim().toLowerCase();
    visible = 100;
    updateResults();
  }, 180);
});
$("result-kind").addEventListener("change", () => {
  kind = $("result-kind").value;
  visible = 100;
  updateResults();
});
$("more-results").addEventListener("click", () => {
  visible += 100;
  updateResults();
});
$("source-go").addEventListener("click", () =>
  openSource(selectedPath, $("source-line-input").value),
);
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("download-source").addEventListener("click", () => {
  const file = result.files.find((f) => f.path === selectedPath);
  if (file)
    download(
      file.content,
      file.path.split("/").pop(),
      "text/plain;charset=utf-8",
    );
});
$("export-analysis").addEventListener("click", () => {
  if (result) {
    const { files, ...report } = result;
    download(
      JSON.stringify(
        {
          version: "1.1",
          ...report,
          files: files.map(({ content, ...f }) => f),
        },
        null,
        2,
      ),
      "style-forge-analysis.json",
      "application/json",
    );
  }
});
for (const b of document.querySelectorAll("[data-workspace]"))
  b.addEventListener("click", () => {
    const analyzer = b.dataset.workspace === "analyzer";
    document.querySelector(".studio").hidden = analyzer;
    document.querySelector(".workspace-bar").hidden = analyzer;
    $("skin-analyzer").hidden = !analyzer;
    $("save-project").hidden = analyzer;
    $("download-top").hidden = analyzer;
    for (const tab of document.querySelectorAll("[data-workspace]")) {
      tab.classList.toggle("active", tab === b);
      tab.setAttribute("aria-selected", String(tab === b));
    }
  });
