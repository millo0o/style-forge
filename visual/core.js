import styles from "./editor.css";
import {
  PROPERTIES,
  MEDIA,
  emptyState,
  validateSelector,
  validateState,
  updateProperty,
  exportCSS,
  uniqueSelector,
  sharedSelector,
  History,
  readReport,
  mapSources,
} from "./model.js";
export function mountEditor(doc = document, options = {}) {
  const win = doc.defaultView;
  if (doc.querySelector("style-forge-editor")) return null;
  const host = doc.createElement("style-forge-editor");
  host.style.cssText =
    "all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;";
  const root = host.attachShadow({ mode: "open" });
  const style = doc.createElement("style");
  style.textContent = styles;
  root.append(style);
  const patchStyle = doc.createElement("style");
  patchStyle.dataset.styleForgePatch = "";
  doc.head.append(patchStyle);
  const el = (tag, content = "", className = "") => {
    const node = doc.createElement(tag);
    node.textContent = content;
    node.className = className;
    return node;
  };
  const panel = el("section", "", "panel");
  panel.setAttribute("aria-label", "STYLE FORGE 비주얼 편집기");
  const header = el("div", "", "header");
  header.append(
    el("span", "✳", "mark"),
    el("strong", "STYLE FORGE"),
    el("small", "VISUAL 1.2"),
  );
  const close = el("button", "×", "quiet");
  close.title = "편집기 닫기 · 임시 변경 제거";
  close.setAttribute("aria-label", close.title);
  header.append(close);
  const body = el("div", "", "body");
  panel.append(header, body);
  const outline = el("div", "", "outline"),
    outlineLabel = el("div", "", "outline-label");
  outline.append(outlineLabel);
  root.append(outline, panel);
  doc.documentElement.append(host);
  let selected = null,
    selector = "",
    media = "all",
    picking = true,
    paused = false,
    report = null,
    disposed = false;
  let history = new History(),
    state = history.current;
  const fields = new Map();
  const toolbar = el("div", "", "toolbar"),
    pick = el("button", "◎ 요소 선택", "primary"),
    undo = el("button", "↶", ""),
    redo = el("button", "↷", ""),
    compare = el("button", "원본 비교");
  undo.title = "실행 취소";
  redo.title = "다시 실행";
  toolbar.append(pick, undo, redo, compare);
  body.append(
    toolbar,
    el(
      "p",
      "쇼핑몰의 글씨·버튼·영역을 클릭하세요. 선택 모드에서는 링크 이동과 버튼 동작을 막습니다. Esc로 선택 모드를 끕니다.",
      "hint",
    ),
  );
  const selection = el("div", "", "selection"),
    selectedTitle = el("strong", "선택한 요소가 없습니다"),
    selectedText = el("p", "화면에서 바꾸고 싶은 영역을 클릭하세요."),
    selectedMeta = el("p", "", "meta"),
    ancestorList = el("div", "", "ancestor-list");
  selection.append(selectedTitle, selectedText, selectedMeta, ancestorList);
  body.append(selection);
  const controls = el("div", "", "selector-controls");
  const scopeLabel = el("label", "대상 범위"),
    scope = el("select");
  for (const [v, t] of [
    ["single", "선택 요소만"],
    ["shared", "같은 class의 요소"],
  ]) {
    const o = el("option", t);
    o.value = v;
    scope.append(o);
  }
  scopeLabel.append(scope);
  const mediaLabel = el("label", "적용 화면"),
    mediaSelect = el("select");
  for (const [v, t] of [
    ["all", "모든 화면"],
    ["mobile", "모바일 ≤ 767px"],
    ["desktop", "데스크톱 ≥ 768px"],
  ]) {
    const o = el("option", t);
    o.value = v;
    mediaSelect.append(o);
  }
  mediaLabel.append(mediaSelect);
  controls.append(scopeLabel, mediaLabel);
  body.append(controls);
  const selectorRow = el("div", "", "selector-row"),
    selectorInput = el("input"),
    applySelector = el("button", "적용");
  selectorInput.setAttribute("aria-label", "CSS 대상 선택자");
  selectorRow.append(selectorInput, applySelector);
  body.append(selectorRow);
  const count = el("p", "", "count"),
    selectorWarning = el("p", "", "warning");
  selectorWarning.hidden = true;
  body.append(count, selectorWarning);
  const editorFields = el("div");
  body.append(editorFields);
  let currentGroup = "";
  let grid;
  for (const p of PROPERTIES) {
    if (currentGroup !== p.group) {
      currentGroup = p.group;
      const section = el("section", "", "section");
      section.append(el("h3", p.group));
      grid = el("div", "", "fields");
      section.append(grid);
      editorFields.append(section);
    }
    const field = el("div", "", p.type === "font" ? "field wide" : "field"),
      label = el("label", p.label),
      control = el("div", "", "control");
    let input;
    if (["font", "weight", "border"].includes(p.type)) {
      input = el("select");
      const opts =
        p.type === "font"
          ? [
              ["__current", "현재 폰트"],
              ["system-ui, sans-serif", "시스템 산세리프"],
              ["Arial, sans-serif", "Arial"],
              ["Georgia, serif", "Georgia"],
              ["monospace", "모노스페이스"],
            ]
          : p.type === "weight"
            ? [
                ["__current", "현재 굵기"],
                ...[
                  "100",
                  "200",
                  "300",
                  "400",
                  "500",
                  "600",
                  "700",
                  "800",
                  "900",
                ].map((v) => [v, v]),
              ]
            : ["none", "solid", "dashed", "dotted", "double"].map((v) => [
                v,
                {
                  none: "없음",
                  solid: "실선",
                  dashed: "대시",
                  dotted: "점선",
                  double: "이중선",
                }[v],
              ]);
      for (const [v, t] of opts) {
        const o = el("option", t);
        o.value = v;
        input.append(o);
      }
    } else {
      input = el("input");
      input.type = p.type;
      if (p.type === "number") {
        input.min = p.min ?? 0;
        input.max = p.max;
        input.step = p.name === "letter-spacing" ? "0.1" : "1";
      }
    }
    input.dataset.property = p.name;
    input.id = "sf-property-" + p.name;
    label.htmlFor = input.id;
    input.setAttribute("aria-label", p.group + " " + p.label);
    const reset = el("button", "↺", "reset");
    reset.type = "button";
    reset.title = p.label + " 변경 제거";
    reset.setAttribute("aria-label", reset.title);
    reset.addEventListener("click", () => change(p.name, null));
    control.append(input);
    if (p.unit) control.append(el("span", p.unit, "unit"));
    control.append(reset);
    field.append(label, control);
    grid.append(field);
    fields.set(p.name, input);
    input.addEventListener("input", () => {
      if (!selected) return;
      let value = input.value;
      if (value === "__current") {
        change(p.name, null);
        return;
      }
      if (p.type === "number") {
        if (
          !value ||
          !Number.isFinite(Number(value)) ||
          Number(value) < Number(input.min) ||
          Number(value) > Number(input.max)
        )
          return;
        value += p.unit;
      }
      if (win.CSS.supports(p.name, value)) change(p.name, value);
    });
  }
  const importantLabel = el("label", "", "important"),
    importantInput = el("input");
  importantInput.type = "checkbox";
  importantInput.checked = true;
  importantLabel.append(
    importantInput,
    doc.createTextNode("!important로 미리보기 우선 적용"),
  );
  body.append(importantLabel);
  const resetTarget = el("button", "선택 범위 변경 제거"),
    resetAll = el("button", "모든 변경 제거");
  const resetRow = el("div", "", "footer-actions");
  resetRow.append(resetTarget, resetAll);
  body.append(resetRow);
  const sourceSection = el("section", "", "section");
  sourceSection.append(el("h3", "스킨 파일 연결"));
  const reportLabel = el("label", "스킨 분석 JSON 연결", "file-picker"),
    reportInput = el("input");
  reportInput.type = "file";
  reportInput.accept = ".json";
  reportInput.setAttribute("aria-label", "스킨 분석 JSON 연결");
  reportLabel.append(reportInput);
  const sourceResults = el("div");
  sourceSection.append(
    reportLabel,
    el(
      "p",
      "스킨 분석기 → 비주얼 연결 JSON 파일을 선택하세요. 원본 스킨 코드는 전송하지 않습니다.",
      "hint",
    ),
    sourceResults,
  );
  body.append(sourceSection);
  const computedDetails = el("details"),
    computedSummary = el("summary", "현재 적용 CSS와 구조"),
    computedList = el("div");
  computedDetails.append(computedSummary, computedList);
  body.append(computedDetails);
  const reviewDetails = el("details"),
    reviewSummary = el("summary", "변경사항 검토"),
    reviewList = el("div", "", "review-list");
  reviewDetails.append(reviewSummary, reviewList);
  body.append(reviewDetails);
  const codeSection = el("section", "", "section");
  codeSection.append(el("h3", "수정 코드"));
  const code = el("textarea", "", "code");
  code.readOnly = true;
  code.setAttribute("aria-label", "변경 CSS");
  const copy = el("button", "CSS 복사"),
    download = el("button", "CSS 다운로드", "primary"),
    exportRow = el("div", "", "footer-actions");
  exportRow.append(copy, download);
  codeSection.append(
    code,
    exportRow,
    el(
      "p",
      "검토한 코드를 별도 override CSS로 연결하세요. FTP·운영 파일은 수정하지 않습니다. 인라인 !important가 있으면 원본 코드 조정이 추가로 필요할 수 있습니다.",
      "hint",
    ),
  );
  body.append(codeSection);
  const save = el("button", "편집 저장"),
    load = el("button", "저장 불러오기"),
    exportProject = el("button", "편집 JSON"),
    importLabel = el("label", "편집 JSON 불러오기", "file-picker"),
    importInput = el("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importLabel.append(importInput);
  const projectRow = el("div", "", "footer-actions");
  projectRow.append(save, load, exportProject);
  body.append(projectRow, importLabel);
  const message = el("p", "", "status");
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  body.append(message);
  const pageKey =
    "style-forge.visual.v1:" + win.location.origin + win.location.pathname;
  const storage = options.storage || {
    async get(key) {
      return JSON.parse(win.localStorage.getItem(key) || "null");
    },
    async set(key, value) {
      win.localStorage.setItem(key, JSON.stringify(value));
    },
  };
  function say(text) {
    message.textContent = text;
  }
  function activeRule() {
    return state.changes.find(
      (r) => r.selector === selector && r.media === media,
    );
  }
  function matching() {
    try {
      return [...doc.querySelectorAll(selector)].filter(
        (e) => e !== host && e !== patchStyle,
      );
    } catch {
      return [];
    }
  }
  function draw() {
    if (!selected?.isConnected) {
      outline.style.display = "none";
      return;
    }
    const rect = selected.getBoundingClientRect();
    outline.style.display = "block";
    Object.assign(outline.style, {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
    outlineLabel.textContent =
      selected.tagName.toLowerCase() + (selected.id ? "#" + selected.id : "");
  }
  function refreshFields() {
    const computed = selected ? win.getComputedStyle(selected) : null;
    const properties = activeRule()?.properties || {};
    for (const p of PROPERTIES) {
      const input = fields.get(p.name);
      input.disabled = !selected;
      let value =
        properties[p.name] ?? computed?.getPropertyValue(p.name) ?? "";
      input.title = "현재 계산값: " + value;
      if (p.type === "color") {
        const match = value.match(/rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);
        input.value = /^#[\da-f]{6}$/i.test(value)
          ? value
          : match
            ? "#" +
              match
                .slice(1, 4)
                .map((n) => Number(n).toString(16).padStart(2, "0"))
                .join("")
            : "#ffffff";
      } else if (p.type === "number") {
        input.value = /^-?[\d.]+px$/.test(value) ? parseFloat(value) : "";
      } else if ([...input.options].some((o) => o.value === value))
        input.value = value;
      else if (input.querySelector('option[value="__current"]')) {
        input.options[0].textContent = value || "현재 값";
        input.value = "__current";
      }
    }
  }
  function refreshSources() {
    sourceResults.replaceChildren();
    if (!report) {
      sourceResults.append(
        el(
          "p",
          "분석 JSON을 연결하면 현재 요소와 맞는 CSS 경로·줄을 보여줍니다.",
          "hint",
        ),
      );
      return;
    }
    const matches = mapSources(selected, report);
    sourceResults.append(
      el(
        "p",
        matches.length + "개 파일 위치 후보 · 실제 적용 우선순위는 별도 확인",
        "hint",
      ),
    );
    for (const r of matches.slice(0, 100)) {
      const card = el("div", "", "source-card");
      card.append(
        el("strong", r.file + ":" + r.line),
        el("p", r.selector),
        el("p", r.context + " · " + r.status),
      );
      sourceResults.append(card);
    }
    if (matches.length > 100)
      sourceResults.append(el("p", "처음 100개만 표시합니다.", "hint"));
  }
  function refreshComputed() {
    computedList.replaceChildren();
    if (!selected) return;
    const computed = win.getComputedStyle(selected);
    for (const p of PROPERTIES) {
      computedList.append(
        el(
          "div",
          p.name + ": " + computed.getPropertyValue(p.name),
          "source-card",
        ),
      );
    }
    let found = 0,
      blocked = 0,
      visited = 0;
    function visitRules(rules, href, context = "기본") {
      for (const rule of rules) {
        if (++visited > 15000) return;
        if (rule.selectorText) {
          try {
            if (selected.matches(rule.selectorText) && found++ < 30) {
              const card = el("div", "", "source-card");
              card.append(
                el("strong", rule.selectorText),
                el("p", href + " · " + context),
                el("p", rule.style.cssText),
              );
              computedList.append(card);
            }
          } catch {}
        } else if (rule.cssRules) {
          let next = context;
          if (rule.conditionText) next = rule.conditionText;
          visitRules(rule.cssRules, href, next);
        }
      }
    }
    for (const sheet of doc.styleSheets) {
      if (sheet.ownerNode === patchStyle) continue;
      try {
        visitRules(sheet.cssRules, sheet.href || "인라인 스타일");
      } catch {
        blocked++;
      }
    }
    computedList.append(
      el(
        "p",
        `브라우저 CSSOM에서 ${found}개 선택자 일치 · 외부 시트 ${blocked}개 읽기 제한. 조건·캐스케이드 우승 여부를 단정하지 않습니다.`,
        "hint",
      ),
    );
  }
  function refreshSummary() {
    const targets = matching().length;
    const condition = MEDIA[media];
    count.textContent = selector
      ? `대상 ${targets}개 · 현재 화면 ${win.innerWidth}px${condition && !win.matchMedia(condition).matches ? " · 미디어 조건 미충족" : ""}`
      : "";
    code.value = exportCSS(state);
    undo.disabled = !history.canUndo;
    redo.disabled = !history.canRedo;
    compare.disabled = !state.changes.length;
    compare.classList.toggle("active", paused);
    compare.textContent = paused ? "변경 화면 보기" : "원본 비교";
    importantInput.checked = state.important;
    reviewSummary.textContent = `변경사항 검토 (${state.changes.length}개 규칙)`;
    reviewList.replaceChildren(
      ...state.changes.map((r) => {
        const item = el("div", r.selector + " · " + r.media, "changes-item");
        item.append(
          el(
            "pre",
            Object.entries(r.properties)
              .map(([p, v]) => p + ": " + v)
              .join("\n"),
          ),
        );
        return item;
      }),
    );
    copy.disabled =
      download.disabled =
      exportProject.disabled =
        !state.changes.length;
    resetTarget.disabled = !selected;
    scope.disabled =
      mediaSelect.disabled =
      selectorInput.disabled =
      applySelector.disabled =
        !selected;
    const inline =
      selected &&
      Object.keys(activeRule()?.properties || {}).some(
        (p) => selected.style.getPropertyPriority(p) === "important",
      );
    selectorWarning.hidden = !inline && !selector.includes(":nth-of-type");
    selectorWarning.textContent = inline
      ? "인라인 !important가 있어 일부 값이 덮어써지지 않을 수 있습니다. 수정 코드에서 원본 인라인 스타일도 검토하세요."
      : "위치 기반 선택자입니다. 상품 순서나 페이지 구조가 바뀌면 대상이 달라질 수 있습니다.";
    draw();
  }
  function render() {
    const css = exportCSS(state);
    patchStyle.textContent = options.applyCSS ? "" : css;
    patchStyle.disabled = paused;
    if (options.applyCSS)
      options
        .applyCSS(paused ? "" : css)
        .then(() => {
          if (!disposed) {
            draw();
            if (computedDetails.open) refreshComputed();
          }
        })
        .catch(() =>
          say(
            "임시 CSS 적용 권한을 확인하세요. 확장 아이콘으로 다시 열어주세요.",
          ),
        );
    refreshSummary();
    if (computedDetails.open) refreshComputed();
  }
  function change(name, value) {
    if (!selected || !selector) return;
    if (!matching().includes(selected)) {
      say("선택 요소와 맞는 선택자를 먼저 적용하세요.");
      return;
    }
    if (
      value !== null &&
      (!win.CSS.supports(name, value) || /[{};\r\n]/.test(value))
    )
      return;
    if (value !== null && !activeRule() && state.changes.length >= 200) {
      say("최대 200개 범위까지 편집할 수 있습니다. 기존 변경을 정리하세요.");
      return;
    }
    state = updateProperty(state, selector, media, name, value);
    history.commit(state, selector + "|" + media + "|" + name);
    paused = false;
    render();
    if (value === null) refreshFields();
    say("화면에 임시 반영했습니다. 서버의 파일은 변경되지 않습니다.");
  }
  function choose(element) {
    if (
      !element ||
      element === host ||
      element === patchStyle ||
      ["HTML", "HEAD", "SCRIPT", "STYLE", "LINK", "META"].includes(
        element.tagName,
      )
    )
      return;
    selected = element;
    const unique = uniqueSelector(element);
    selector = unique.selector;
    scope.value = "single";
    selectorInput.value = selector;
    selectedTitle.textContent =
      element.tagName.toLowerCase() +
      (element.id ? "#" + element.id : "") +
      [...element.classList].map((c) => "." + c).join("");
    selectedText.textContent =
      (element.textContent || "").replace(/\s+/g, " ").slice(0, 100) ||
      "(텍스트 없음)";
    selectedMeta.textContent =
      "module: " +
      (element.getAttribute("module") || "없음") +
      " · " +
      Math.round(element.getBoundingClientRect().width) +
      " × " +
      Math.round(element.getBoundingClientRect().height) +
      "px";
    ancestorList.replaceChildren();
    let parent = element.parentElement;
    for (let i = 0; parent && i < 5; i++, parent = parent.parentElement) {
      if (parent === doc.documentElement) break;
      const target = parent,
        b = el(
          "button",
          "↑ " +
            parent.tagName.toLowerCase() +
            (parent.id ? "#" + parent.id : ""),
        );
      b.addEventListener("click", () => choose(target));
      ancestorList.append(b);
    }
    refreshFields();
    refreshSources();
    refreshSummary();
    if (computedDetails.open) refreshComputed();
    say("선택한 요소의 스타일을 조절하세요.");
  }
  function onClick(event) {
    if (
      event.composedPath().includes(host) ||
      !picking ||
      !(event.target instanceof win.Element)
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    choose(event.target);
  }
  function onPointer(event) {
    if (
      !picking ||
      event.composedPath().includes(host) ||
      !(event.target instanceof win.Element)
    )
      return;
    const r = event.target.getBoundingClientRect();
    Object.assign(outline.style, {
      display: "block",
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
    });
    outlineLabel.textContent = event.target.tagName.toLowerCase();
  }
  function setPicking(value) {
    picking = value;
    pick.textContent = picking ? "◎ 요소 선택 중" : "◎ 요소 선택";
    pick.classList.toggle("primary", picking);
    if (!picking) draw();
  }
  function onKey(event) {
    if (event.key === "Escape") {
      setPicking(false);
      say("선택 모드를 껐습니다. 쇼핑몰을 정상적으로 탐색할 수 있습니다.");
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "z" &&
      !event
        .composedPath()
        .some((e) => ["INPUT", "TEXTAREA", "SELECT"].includes(e.tagName))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      state = event.shiftKey ? history.redo() : history.undo();
      render();
      refreshFields();
    }
  }
  win.addEventListener("click", onClick, true);
  doc.addEventListener("pointermove", onPointer, true);
  doc.addEventListener("keydown", onKey, true);
  function onResize() {
    refreshSummary();
    refreshFields();
    if (computedDetails.open) refreshComputed();
  }
  win.addEventListener("resize", onResize);
  doc.addEventListener("scroll", draw, true);
  pick.addEventListener("click", () => setPicking(!picking));
  undo.addEventListener("click", () => {
    state = history.undo();
    render();
    refreshFields();
  });
  redo.addEventListener("click", () => {
    state = history.redo();
    render();
    refreshFields();
  });
  compare.addEventListener("click", () => {
    paused = !paused;
    render();
    say(
      paused ? "원본 화면입니다. 변경 CSS는 유지됩니다." : "변경 화면입니다.",
    );
  });
  scope.addEventListener("change", () => {
    if (!selected) return;
    const next =
      scope.value === "shared"
        ? sharedSelector(selected)
        : uniqueSelector(selected).selector;
    if (!next) {
      scope.value = "single";
      say(
        "class가 없는 요소입니다. 상위 영역을 선택하거나 선택자를 직접 입력하세요.",
      );
      return;
    }
    selector = next;
    selectorInput.value = selector;
    refreshFields();
    refreshSummary();
  });
  mediaSelect.addEventListener("change", () => {
    media = mediaSelect.value;
    refreshFields();
    refreshSummary();
  });
  applySelector.addEventListener("click", () => {
    try {
      const next = validateSelector(selectorInput.value.trim(), doc);
      if (!selected?.matches(next))
        throw Error("현재 선택 요소와 일치하는 선택자를 입력하세요.");
      selector = next;
      refreshFields();
      refreshSummary();
      say("대상 " + matching().length + "개에 적용합니다.");
    } catch (e) {
      say(e.message);
    }
  });
  importantInput.addEventListener("change", () => {
    state = { ...state, important: importantInput.checked };
    history.commit(state);
    render();
  });
  resetTarget.addEventListener("click", () => {
    state = {
      ...state,
      changes: state.changes.filter(
        (r) => r.selector !== selector || r.media !== media,
      ),
    };
    history.commit(state);
    render();
    refreshFields();
  });
  resetAll.addEventListener("click", () => {
    if (
      state.changes.length &&
      !win.confirm(
        "모든 임시 변경을 제거할까요? 실행 취소로 복원할 수 있습니다.",
      )
    )
      return;
    state = emptyState();
    history.commit(state);
    paused = false;
    render();
    refreshFields();
  });
  function downloadText(value, name, type) {
    const url = win.URL.createObjectURL(new Blob([value], { type })),
      link = el("a");
    link.href = url;
    link.download = name;
    root.append(link);
    link.click();
    link.remove();
    win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
  }
  download.addEventListener("click", () => {
    downloadText(
      exportCSS(state),
      "style-forge-overrides.css",
      "text/css;charset=utf-8",
    );
    say("CSS를 다운로드했습니다. 변경사항 검토 후 별도 파일로 적용하세요.");
  });
  copy.addEventListener("click", async () => {
    try {
      if (win.navigator.clipboard && win.isSecureContext)
        await win.navigator.clipboard.writeText(exportCSS(state));
      else {
        const t = el("textarea", exportCSS(state));
        t.style.position = "fixed";
        t.style.opacity = "0";
        doc.body.append(t);
        t.select();
        const ok = doc.execCommand("copy");
        t.remove();
        if (!ok) throw Error("copy");
      }
      say("CSS를 복사했습니다.");
    } catch {
      say("복사 권한을 확인하거나 CSS 다운로드를 사용하세요.");
    }
  });
  async function readJSON(input) {
    const file = input.files[0];
    input.value = "";
    if (!file) return null;
    if (file.size > 50 * 1024 * 1024)
      throw Error("JSON 파일은 50 MB 이하여야 합니다.");
    return JSON.parse(await file.text());
  }
  reportInput.addEventListener("change", async () => {
    try {
      const raw = await readJSON(reportInput);
      if (!raw) return;
      report = readReport(raw);
      refreshSources();
      say("스킨 분석 결과를 연결했습니다.");
    } catch (e) {
      say("분석 JSON을 읽지 못했습니다: " + e.message);
    }
  });
  save.addEventListener("click", async () => {
    try {
      await storage.set(pageKey, { state, report });
      say("이 페이지의 편집을 브라우저에 저장했습니다.");
    } catch {
      say("브라우저 저장 공간 또는 권한을 확인하세요.");
    }
  });
  load.addEventListener("click", async () => {
    try {
      const data = await storage.get(pageKey);
      if (!data) {
        say("이 페이지에 저장된 편집이 없습니다.");
        return;
      }
      const next = validateState(data.state, doc);
      if (data.report) report = readReport({ ...data.report, files: [] });
      state = next;
      history.commit(state);
      paused = false;
      render();
      refreshFields();
      refreshSources();
      say("저장된 편집을 화면에 임시 적용했습니다.");
    } catch (e) {
      say("불러오지 못했습니다: " + e.message);
    }
  });
  exportProject.addEventListener("click", () =>
    downloadText(
      JSON.stringify({ state, report }, null, 2),
      "style-forge-edit.json",
      "application/json",
    ),
  );
  importInput.addEventListener("change", async () => {
    try {
      const data = await readJSON(importInput);
      if (!data) return;
      const next = validateState(data.state, doc);
      const nextReport = data.report
        ? readReport({ ...data.report, files: [] })
        : null;
      state = next;
      report = nextReport;
      history.commit(state);
      paused = false;
      render();
      refreshFields();
      refreshSources();
      say("편집 JSON을 불러왔습니다.");
    } catch (e) {
      say("편집 JSON을 읽지 못했습니다: " + e.message);
    }
  });
  computedDetails.addEventListener("toggle", () => {
    if (computedDetails.open) refreshComputed();
  });
  const observer = new win.MutationObserver(() => {
    if (!selected?.isConnected && selected) {
      selected = null;
      selectedTitle.textContent = "선택 요소가 페이지에서 제거되었습니다.";
      refreshFields();
      refreshSummary();
      say("페이지가 변경되었습니다. 요소를 다시 선택하세요.");
    } else draw();
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  function destroy() {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    win.removeEventListener("click", onClick, true);
    doc.removeEventListener("pointermove", onPointer, true);
    doc.removeEventListener("keydown", onKey, true);
    win.removeEventListener("resize", onResize);
    doc.removeEventListener("scroll", draw, true);
    patchStyle.remove();
    if (options.applyCSS) options.applyCSS("").catch(() => {});
    host.remove();
    options.onClose?.();
  }
  close.addEventListener("click", () => {
    if (
      state.changes.length &&
      !win.confirm(
        "편집기를 닫으면 임시 적용이 제거됩니다. 저장·내보내기를 완료했나요?",
      )
    )
      return;
    destroy();
  });
  render();
  refreshFields();
  refreshSources();
  say("요소를 클릭해 편집을 시작하세요.");
  return { host, destroy, choose, getState: () => structuredClone(state) };
}
