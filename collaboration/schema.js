import { PROPERTIES, MEDIA, exportCSS } from "../visual/model.js";
const allowed = new Set(PROPERTIES.map((p) => p.name));
export const STATES = {
  pending: "검토 대기",
  approved: "승인",
  rejected: "반려",
  revision_requested: "수정 요청",
  applied: "적용 완료",
};
export function pageURL(value) {
  const u = new URL(value);
  if (!["http:", "https:"].includes(u.protocol) || u.username || u.password)
    throw Error("올바른 홈페이지 주소가 아닙니다.");
  for (const name of u.searchParams.keys())
    if (
      /^(password|pass|token|access_token|refresh_token|auth|authorization|session|sessionid|sid|api_key|key)$/i.test(
        name,
      )
    )
      throw Error(
        "인증 정보가 포함된 주소는 제출할 수 없습니다. 일반 페이지 주소를 사용하세요.",
      );
  u.searchParams.sort();
  return u.origin + u.pathname + u.search;
}
export function validateItems(raw, origin, validateCSS = () => true) {
  if (!Array.isArray(raw) || !raw.length || raw.length > 200)
    throw Error("수정 항목은 1–200개여야 합니다.");
  return raw.map((item) => {
    const url = pageURL(item.pageUrl);
    if (new URL(url).origin !== origin)
      throw Error("프로젝트에 등록된 사이트의 수정안만 제출할 수 있습니다.");
    if (
      typeof item.selector !== "string" ||
      !item.selector ||
      item.selector.length > 1000 ||
      /[{};\r\n]|\/\*/.test(item.selector) ||
      !Object.hasOwn(MEDIA, item.media)
    )
      throw Error("잘못된 대상 선택자 또는 화면 범위");
    const properties = {};
    for (const [name, value] of Object.entries(item.properties || {})) {
      if (
        !allowed.has(name) ||
        typeof value !== "string" ||
        value.length > 250 ||
        /[{};\r\n]|url\s*\(/i.test(value) ||
        !validateCSS(name, value)
      )
        throw Error("허용되지 않은 CSS 속성: " + name);
      properties[name] = value;
    }
    if (!Object.keys(properties).length) throw Error("변경한 CSS가 없습니다.");
    const before = {};
    for (const name of Object.keys(properties))
      if (typeof item.before?.[name] === "string")
        before[name] = item.before[name].slice(0, 250);
    const sources = Array.isArray(item.sources)
      ? item.sources
          .slice(0, 30)
          .filter(
            (s) =>
              typeof s.file === "string" &&
              s.file.length < 1000 &&
              !/(^|\/)\.\.(\/|$)/.test(s.file) &&
              Number.isInteger(s.line) &&
              s.line > 0,
          )
          .map((s) => ({ file: s.file, line: s.line }))
      : [];
    return {
      pageUrl: url,
      selector: item.selector,
      media: item.media,
      properties,
      before,
      sources,
      important: item.important !== false,
      label: String(item.label || item.selector).slice(0, 160),
    };
  });
}
export function itemCSS(item) {
  return exportCSS({
    important: item.important !== false,
    changes: [
      {
        selector: item.selector,
        media: item.media,
        properties: item.properties,
      },
    ],
  });
}
export function requestSummary(request) {
  request = structuredClone(request);
  return {
    ...request,
    pages: [...new Set(request.items.map((i) => i.pageUrl))],
    pending: request.items.filter((i) => i.status === "pending").length,
    approved: request.items.filter((i) => i.status === "approved").length,
  };
}
