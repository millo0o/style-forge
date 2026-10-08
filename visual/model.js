export const PROPERTIES = [
  { name: "font-family", label: "폰트", type: "font", group: "글씨" },
  {
    name: "font-size",
    label: "크기",
    type: "number",
    unit: "px",
    max: 300,
    group: "글씨",
  },
  { name: "font-weight", label: "굵기", type: "weight", group: "글씨" },
  {
    name: "line-height",
    label: "행간",
    type: "number",
    unit: "px",
    max: 500,
    group: "글씨",
  },
  {
    name: "letter-spacing",
    label: "자간",
    type: "number",
    unit: "px",
    min: -20,
    max: 100,
    group: "글씨",
  },
  { name: "color", label: "글씨 색", type: "color", group: "색상" },
  { name: "background-color", label: "배경 색", type: "color", group: "색상" },
  ...["top", "right", "bottom", "left"].map((side) => ({
    name: "padding-" + side,
    label: { top: "위", right: "오른쪽", bottom: "아래", left: "왼쪽" }[side],
    type: "number",
    unit: "px",
    max: 500,
    group: "안쪽 여백",
  })),
  ...["top", "right", "bottom", "left"].map((side) => ({
    name: "margin-" + side,
    label: { top: "위", right: "오른쪽", bottom: "아래", left: "왼쪽" }[side],
    type: "number",
    unit: "px",
    min: -500,
    max: 500,
    group: "바깥 여백",
  })),
  {
    name: "width",
    label: "너비",
    type: "number",
    unit: "px",
    max: 3000,
    group: "크기 & 테두리",
  },
  {
    name: "height",
    label: "높이",
    type: "number",
    unit: "px",
    max: 3000,
    group: "크기 & 테두리",
  },
  {
    name: "border-radius",
    label: "모서리",
    type: "number",
    unit: "px",
    max: 500,
    group: "크기 & 테두리",
  },
  {
    name: "border-width",
    label: "테두리 두께",
    type: "number",
    unit: "px",
    max: 50,
    group: "크기 & 테두리",
  },
  {
    name: "border-style",
    label: "테두리 종류",
    type: "border",
    group: "크기 & 테두리",
  },
  {
    name: "border-color",
    label: "테두리 색",
    type: "color",
    group: "크기 & 테두리",
  },
];
export const MEDIA = {
  all: "",
  mobile: "(max-width: 767px)",
  desktop: "(min-width: 768px)",
};
export const emptyState = () => ({
  version: "1.2",
  important: true,
  changes: [],
});
const names = new Set(PROPERTIES.map((p) => p.name));
export function validateSelector(selector, doc) {
  if (
    typeof selector !== "string" ||
    selector.length > 1000 ||
    /[{};\r\n]|\/\*/.test(selector)
  )
    throw Error("올바른 CSS 선택자를 입력하세요.");
  doc.querySelectorAll(selector);
  return selector;
}
export function validateState(raw, doc) {
  if (!raw || !Array.isArray(raw.changes) || raw.changes.length > 200)
    throw Error("지원하지 않는 편집 프로젝트입니다.");
  const changes = [];
  for (const change of raw.changes) {
    validateSelector(change.selector, doc);
    if (!Object.hasOwn(MEDIA, change.media))
      throw Error("미디어 조건이 올바르지 않습니다.");
    const properties = {};
    for (const [name, value] of Object.entries(change.properties || {})) {
      if (
        !names.has(name) ||
        typeof value !== "string" ||
        value.length > 250 ||
        /[{};\r\n]|url\s*\(/i.test(value) ||
        !doc.defaultView.CSS.supports(name, value)
      )
        throw Error("지원하지 않는 CSS 속성: " + name);
      properties[name] = value;
    }
    if (Object.keys(properties).length)
      changes.push({
        selector: change.selector,
        media: change.media,
        properties,
      });
  }
  return { version: "1.2", important: raw.important !== false, changes };
}
export function updateProperty(state, selector, media, name, value) {
  if (!names.has(name)) throw Error("지원하지 않는 속성");
  const copy = structuredClone(state);
  let rule = copy.changes.find(
    (r) => r.selector === selector && r.media === media,
  );
  if (!rule) {
    rule = { selector, media, properties: {} };
    copy.changes.push(rule);
  }
  if (value === null) delete rule.properties[name];
  else rule.properties[name] = value;
  copy.changes = copy.changes.filter((r) => Object.keys(r.properties).length);
  return copy;
}
export function exportCSS(state) {
  const rules = state.changes.map((r) => {
    const block =
      r.selector +
      " {\n" +
      Object.entries(r.properties)
        .map(
          ([k, v]) =>
            "  " + k + ": " + v + (state.important ? " !important" : "") + ";",
        )
        .join("\n") +
      "\n}";
    return MEDIA[r.media]
      ? "@media " +
          MEDIA[r.media] +
          " {\n" +
          block
            .split("\n")
            .map((l) => "  " + l)
            .join("\n") +
          "\n}"
      : block;
  });
  return (
    "/* STYLE FORGE v1.2 · 검토 후 별도 override CSS로 적용 */\n" +
    rules.join("\n\n") +
    "\n"
  );
}
export function uniqueSelector(element) {
  const doc = element.ownerDocument,
    CSS = doc.defaultView.CSS;
  if (element.id) {
    const s = "#" + CSS.escape(element.id);
    if (doc.querySelectorAll(s).length === 1)
      return { selector: s, fragile: false };
  }
  let parts = [],
    current = element;
  while (current && current.nodeType === 1) {
    let part = current.tagName.toLowerCase();
    const classes = [...current.classList]
      .filter((c) => !/[{}]/.test(c))
      .slice(0, 3);
    if (classes.length)
      part += classes.map((c) => "." + CSS.escape(c)).join("");
    const same = current.parentElement
      ? [...current.parentElement.children].filter(
          (e) => e.tagName === current.tagName,
        )
      : [];
    if (same.length > 1)
      part += ":nth-of-type(" + (same.indexOf(current) + 1) + ")";
    parts.unshift(part);
    const selector = parts.join(" > ");
    if (doc.querySelectorAll(selector).length === 1)
      return { selector, fragile: selector.includes(":nth-of-type") };
    current = current.parentElement;
  }
  return { selector: parts.join(" > "), fragile: true };
}
export function sharedSelector(element) {
  const classes = [...element.classList].filter((c) => !/[{}]/.test(c));
  if (!classes.length) return null;
  return (
    element.tagName.toLowerCase() +
    classes
      .map((c) => "." + element.ownerDocument.defaultView.CSS.escape(c))
      .join("")
  );
}
export class History {
  constructor(initial = emptyState()) {
    this.states = [structuredClone(initial)];
    this.index = 0;
    this.lastKey = "";
    this.lastTime = 0;
  }
  get current() {
    return structuredClone(this.states[this.index]);
  }
  commit(state, key = "", now = Date.now()) {
    if (JSON.stringify(state) === JSON.stringify(this.states[this.index]))
      return;
    const coalesce =
      key &&
      key === this.lastKey &&
      now - this.lastTime < 450 &&
      this.index === this.states.length - 1 &&
      this.index > 0;
    this.states = this.states.slice(0, this.index + 1);
    if (coalesce) this.states[this.index] = structuredClone(state);
    else {
      this.states.push(structuredClone(state));
      this.index++;
    }
    if (this.states.length > 101) {
      this.states.shift();
      this.index--;
    }
    this.lastKey = key;
    this.lastTime = now;
  }
  undo() {
    if (this.index > 0) this.index--;
    this.lastKey = "";
    return this.current;
  }
  redo() {
    if (this.index < this.states.length - 1) this.index++;
    this.lastKey = "";
    return this.current;
  }
  get canUndo() {
    return this.index > 0;
  }
  get canRedo() {
    return this.index < this.states.length - 1;
  }
}
export function readReport(raw) {
  if (
    !raw ||
    !Array.isArray(raw.rules) ||
    raw.rules.length > 30000 ||
    !Array.isArray(raw.files)
  )
    throw Error("스킨 분석기에서 내보낸 JSON을 선택하세요.");
  return {
    rules: raw.rules
      .filter(
        (r) =>
          typeof r.selector === "string" &&
          r.selector.length <= 1000 &&
          typeof r.file === "string" &&
          r.file.length <= 2000 &&
          !/(^|\/)\.\.(\/|$)/.test(r.file) &&
          Number.isInteger(r.line) &&
          r.line > 0,
      )
      .map((r) => ({
        selector: r.selector,
        file: r.file,
        line: r.line,
        context: String(r.context || "기본").slice(0, 2000),
      })),
  };
}
export function mapSources(element, report) {
  if (!element || !report) return [];
  return report.rules
    .filter((r) => {
      try {
        return element.matches(r.selector);
      } catch {
        return false;
      }
    })
    .map((r) => ({
      ...r,
      status: "현재 DOM 선택자 일치 · 적용 우선순위 미확인",
    }));
}
