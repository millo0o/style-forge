import { parse as parseHTML } from "parse5";
import * as cssTree from "css-tree";
import { parse as parseJS } from "acorn";
import * as walk from "acorn-walk";
const MAX_RECORDS = 100000;
const lineAt = (text, index) => text.slice(0, index).split("\n").length;
const tokenPattern = /([.#])(-?[_a-zA-Z\u0080-\uffff][\w\-\u0080-\uffff]*)/g;
export function analyze(files, initialWarnings = []) {
  const warnings = [...initialWarnings],
    symbols = new Map(),
    elements = [],
    rules = [],
    references = [],
    javascript = [];
  let nextId = 0;
  const paths = new Set(files.map((f) => f.path));
  function symbol(kind, name, record) {
    const key = (kind === "class" ? "." : "#") + name;
    if (!symbols.has(key))
      symbols.set(key, { key, kind, name, occurrences: [] });
    symbols.get(key).occurrences.push(record);
  }
  function resolve(from, target) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(target) || /[{$}]/.test(target))
      return { target, status: "외부/동적 참조", resolved: null };
    const clean = target.split(/[?#]/)[0];
    let candidates = [];
    function normalize(p) {
      const parts = [];
      for (const s of p.split("/")) {
        if (s === "..") parts.pop();
        else if (s && s !== ".") parts.push(s);
      }
      return parts.join("/");
    }
    if (clean.startsWith("/")) {
      const parts = from.split("/");
      for (let i = parts.length - 1; i >= 0; i--)
        candidates.push(normalize(parts.slice(0, i).join("/") + clean));
    } else
      candidates.push(
        normalize(from.slice(0, from.lastIndexOf("/") + 1) + clean),
      );
    candidates = [...new Set(candidates)].filter((p) => paths.has(p));
    return {
      target,
      resolved: candidates[0] || null,
      candidates,
      status:
        candidates.length === 1
          ? "파일 확인"
          : candidates.length > 1
            ? "경로 후보 여러 개"
            : "미확인",
    };
  }
  function jsAnalyze(text, file, offset = 0) {
    let ast;
    try {
      try {
        ast = parseJS(text, {
          ecmaVersion: "latest",
          sourceType: "module",
          locations: true,
        });
      } catch {
        ast = parseJS(text, {
          ecmaVersion: "latest",
          sourceType: "script",
          locations: true,
          allowReturnOutsideFunction: true,
        });
      }
    } catch (e) {
      warnings.push(
        `${file}:${offset + e.loc?.line || 1} JS 구문 분석 실패: 문자열 후보만 검색합니다.`,
      );
      for (const m of text.matchAll(/(['"])([.#][^'"\n]+)\1/g))
        javascript.push({
          file,
          line: offset + lineAt(text, m.index),
          selector: m[2],
          event: "구문 미확인",
          status: "추정",
        });
      return;
    }
    const literal = (n) =>
      n?.type === "Literal" && typeof n.value === "string" ? n.value : null;
    const method = (n) =>
      n?.type === "MemberExpression"
        ? n.computed
          ? literal(n.property)
          : n.property.name
        : null;
    function selection(n) {
      if (n?.type !== "CallExpression") return null;
      const value = literal(n.arguments[0]);
      if (!value) return null;
      if (
        n.callee.type === "Identifier" &&
        ["$", "jQuery"].includes(n.callee.name)
      )
        return value;
      const m = method(n.callee);
      return m === "getElementById"
        ? "#" + value
        : m === "getElementsByClassName"
          ? "." + value.trim().split(/\s+/).join(".")
          : ["querySelector", "querySelectorAll"].includes(m)
            ? value
            : null;
    }
    walk.simple(ast, {
      CallExpression(n) {
        const own = selection(n);
        if (own)
          javascript.push({
            file,
            line: offset + n.loc.start.line,
            selector: own,
            event: "선택자 조회",
            status: "정적 문자열",
          });
        const m = method(n.callee),
          obj = n.callee.object;
        const eventMethods = [
          "on",
          "one",
          "bind",
          "addEventListener",
          "click",
          "change",
          "mouseenter",
          "mouseleave",
          "hover",
          "submit",
          "scroll",
          "resize",
          "keydown",
          "keyup",
          "focus",
          "blur",
        ];
        if (eventMethods.includes(m)) {
          const target = selection(obj) || "(변수/동적 대상)";
          const delegated = ["on", "one"].includes(m)
            ? literal(n.arguments[1])
            : null;
          const event = ["on", "one", "bind", "addEventListener"].includes(m)
            ? literal(n.arguments[0]) || "동적 이벤트"
            : m;
          javascript.push({
            file,
            line: offset + n.loc.start.line,
            selector: delegated || target,
            event: delegated ? `${event} · 위임(${target})` : event,
            status:
              delegated || target !== "(변수/동적 대상)"
                ? "정적 문자열 · 실행 미확인"
                : "미확인",
          });
        }
        if (
          ["addClass", "removeClass", "toggleClass"].includes(m) ||
          (["add", "remove", "toggle"].includes(m) &&
            method(obj) === "classList")
        ) {
          const v = literal(n.arguments[0]);
          if (v)
            javascript.push({
              file,
              line: offset + n.loc.start.line,
              selector: v
                .split(/\s+/)
                .map((c) => "." + c)
                .join(" "),
              event: "클래스 변경 · " + m,
              status: "추정",
            });
        }
      },
      NewExpression(n) {
        if (n.callee.name === "Swiper")
          javascript.push({
            file,
            line: offset + n.loc.start.line,
            selector: literal(n.arguments[0]) || "(동적 대상)",
            event: "Swiper 초기화",
            status: literal(n.arguments[0]) ? "정적 문자열" : "미확인",
          });
      },
    });
  }
  function cssAnalyze(text, file, offset = 0) {
    let ast;
    try {
      ast = cssTree.parse(text, {
        positions: true,
        onParseError: (e) =>
          warnings.push(`${file}:${offset + e.line} CSS 파싱 경고`),
      });
    } catch (e) {
      warnings.push(`${file}: CSS 분석 실패 — ${e.message}`);
      return;
    }
    let scopes = [];
    cssTree.walk(ast, {
      enter(node) {
        if (
          node.type === "Atrule" &&
          node.name.toLowerCase() === "import" &&
          node.prelude
        ) {
          let target;
          cssTree.walk(node.prelude, (n) => {
            if (!target && ["String", "Url"].includes(n.type)) target = n.value;
          });
          if (target)
            references.push({
              file,
              line: offset + node.loc.start.line,
              kind: "CSS @import",
              ...resolve(file, target),
            });
        }
        if (node.type === "Atrule" && node.block)
          scopes.push(
            "@" +
              node.name +
              (node.prelude ? " " + cssTree.generate(node.prelude) : ""),
          );
        if (node.type === "Rule" && node.prelude.type === "SelectorList") {
          const declarations = [];
          node.block.children.forEach((d) => {
            if (d.type === "Declaration")
              declarations.push({
                property: d.property,
                value: cssTree.generate(d.value),
                important: d.important,
              });
          });
          node.prelude.children.forEach((selector) => {
            const selectorText = cssTree.generate(selector);
            const tokens = [];
            cssTree.walk(selector, (n) => {
              if (n.type === "ClassSelector") tokens.push("." + n.name);
              if (n.type === "IdSelector") tokens.push("#" + n.name);
            });
            rules.push({
              file,
              line: offset + selector.loc.start.line,
              selector: selectorText,
              tokens: [...new Set(tokens)],
              context: scopes.join(" → ") || "기본",
              order: rules.length + 1,
              specificity: specificity(selector),
              important: declarations.some((d) => d.important),
              declarations,
              ast: selector,
            });
          });
        }
      },
      leave(node) {
        if (node.type === "Atrule" && node.block) scopes.pop();
      },
    });
  }
  for (const file of files) {
    if (file.type === "css") {
      cssAnalyze(file.content, file.path);
      continue;
    }
    if (file.type === "js") {
      jsAnalyze(file.content, file.path);
      continue;
    }
    const root = parseHTML(file.content, { sourceCodeLocationInfo: true });
    function visit(node, parent) {
      let current = parent;
      if (node.tagName) {
        const attrs = Object.fromEntries(
          (node.attrs || []).map((a) => [a.name, a.value]),
        );
        const loc = node.sourceCodeLocation;
        current = {
          id: nextId++,
          tag: node.tagName,
          attrs,
          parent,
          children: [],
          file: file.path,
          line: loc?.startLine || null,
        };
        if (parent) parent.children.push(current);
        elements.push(current);
        if (elements.length > MAX_RECORDS)
          throw Error("HTML 요소 제한(100,000개)을 초과했습니다.");
        if (loc) {
          for (const name of (attrs.class || "").split(/\s+/).filter(Boolean))
            symbol("class", name, {
              file: file.path,
              line: loc.attrs?.class?.startLine || loc.startLine,
              tag: node.tagName,
              element: current.id,
            });
          if (attrs.id)
            symbol("id", attrs.id, {
              file: file.path,
              line: loc.attrs?.id?.startLine || loc.startLine,
              tag: node.tagName,
              element: current.id,
            });
          if (attrs.module)
            references.push({
              file: file.path,
              line: loc.attrs?.module?.startLine || loc.startLine,
              kind: "module",
              target: attrs.module,
              status: "카페24 모듈 · 실행 미확인",
            });
          for (const [attr, value] of Object.entries(attrs)) {
            if (attr.startsWith("on"))
              javascript.push({
                file: file.path,
                line: loc.attrs?.[attr]?.startLine || loc.startLine,
                selector: attrs.id
                  ? "#" + attrs.id
                  : (attrs.class || "")
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((c) => "." + c)
                      .join("") || node.tagName,
                event: attr,
                status: "인라인 이벤트 · 실행 미확인",
                code: value,
              });
          }
          if (
            (node.tagName === "link" && attrs.href) ||
            (node.tagName === "script" && attrs.src)
          )
            references.push({
              file: file.path,
              line: loc.startLine,
              kind:
                node.tagName === "link"
                  ? (attrs.rel || "").split(/\s+/).includes("stylesheet")
                    ? "stylesheet"
                    : "link"
                  : "script",
              ...resolve(file.path, attrs.href || attrs.src),
            });
          if (
            (node.tagName === "style" || node.tagName === "script") &&
            loc.startTag &&
            loc.endTag
          ) {
            const text = file.content.slice(
                loc.startTag.endOffset,
                loc.endTag.startOffset,
              ),
              offset = lineAt(file.content, loc.startTag.endOffset) - 1;
            if (node.tagName === "style") cssAnalyze(text, file.path, offset);
            else if (
              !attrs.src &&
              (!attrs.type || /javascript|module/.test(attrs.type))
            )
              jsAnalyze(text, file.path, offset);
          }
        }
      }
      for (const child of node.childNodes || []) visit(child, current);
      if (node.content) visit(node.content, current);
    }
    visit(root, null);
    for (const m of file.content.matchAll(
      /<!--\s*@(import|layout|css|js)\s*\(([^)]+)\)\s*-->/gi,
    ))
      references.push({
        file: file.path,
        line: lineAt(file.content, m.index),
        kind: "@" + m[1].toLowerCase(),
        ...resolve(file.path, m[2].trim().replace(/^['"]|['"]$/g, "")),
      });
  }
  if (rules.length + javascript.length + references.length > MAX_RECORDS)
    throw Error("분석 항목 제한(100,000개)을 초과했습니다.");
  const byToken = new Map();
  for (const s of symbols.values())
    byToken.set(s.key, new Set(s.occurrences.map((o) => o.element)));
  const byTag = new Map();
  for (const el of elements) {
    if (!byTag.has(el.tag)) byTag.set(el.tag, []);
    byTag.get(el.tag).push(el.id);
  }
  let truncated = 0;
  for (const rule of rules) {
    // Candidate anchors must belong to the RIGHTMOST compound selector.
    // An ancestor's .class must not exclude descendant type-only targets (.moreBtn a).
    let target = [];
    rule.ast.children.forEach((n) => {
      if (n.type === "Combinator") target = [];
      else target.push(n);
    });
    const anchors = target
      .filter((n) => n.type === "ClassSelector" || n.type === "IdSelector")
      .map((n) => (n.type === "ClassSelector" ? "." : "#") + n.name);
    const type = target.find(
      (n) => n.type === "TypeSelector" && n.name !== "*",
    );
    const candidates = anchors.length
      ? [...(byToken.get(anchors[0]) || [])]
      : type
        ? byTag.get(type.name.toLowerCase()) || []
        : elements.map((e) => e.id);
    const namedCandidates = [
      ...new Set(rule.tokens.flatMap((t) => [...(byToken.get(t) || [])])),
    ];
    rule.matches = [];
    let count = 0;
    for (const id of candidates) {
      const el = elements[id];
      const m = matchSelector(el, rule.ast);
      if (m === true && el.line) {
        count++;
        if (rule.matches.length < 200)
          rule.matches.push({
            file: el.file,
            line: el.line,
            tag: el.tag,
            status: "정적 구조 일치",
          });
      }
    }
    rule.matchCount = count;
    if (count > 200) truncated++;
    rule.status = count
      ? "정적 구조 일치"
      : namedCandidates.length
        ? "이름 후보 · 구조/동적 상태 미확인"
        : "미확인";
    rule.candidateFiles = [
      ...new Set(namedCandidates.map((id) => elements[id].file)),
    ];
    delete rule.ast;
  }
  if (truncated)
    warnings.push(
      `${truncated}개 선택자의 HTML 연결은 처음 200개만 표시합니다. 전체 일치 수는 별도로 표시합니다.`,
    );
  for (const j of javascript) {
    const tokens = [...j.selector.matchAll(tokenPattern)].map(
      (m) => m[1] + m[2],
    );
    const candidates = [
      ...new Map(
        tokens
          .flatMap((t) => symbols.get(t)?.occurrences || [])
          .map((o) => [o.element, o]),
      ).values(),
    ];
    j.candidateCount = candidates.length;
    j.candidates = candidates.slice(0, 50);
  }
  for (const rule of rules) rule.duplicateCount = 0;
  const duplicateCounts = new Map();
  for (const r of rules)
    duplicateCounts.set(r.selector, (duplicateCounts.get(r.selector) || 0) + 1);
  for (const r of rules) r.duplicateCount = duplicateCounts.get(r.selector);
  return {
    files,
    symbols: [...symbols.values()].sort((a, b) => a.key.localeCompare(b.key)),
    rules,
    references,
    javascript,
    warnings,
    stats: {
      html: files.filter((f) => f.type === "html").length,
      css: files.filter((f) => f.type === "css").length,
      js: files.filter((f) => f.type === "js").length,
      elements: elements.filter((e) => e.line).length,
      selectors: rules.length,
      classes: [...symbols.values()].filter((s) => s.kind === "class").length,
      ids: [...symbols.values()].filter((s) => s.kind === "id").length,
    },
  };
}
function specificity(selector) {
  const sum = [0, 0, 0];
  function add(arr) {
    arr.forEach((v, i) => (sum[i] += v));
  }
  selector.children.forEach((n) => {
    if (n.type === "IdSelector") sum[0]++;
    else if (["ClassSelector", "AttributeSelector"].includes(n.type)) sum[1]++;
    else if (n.type === "TypeSelector" && n.name !== "*") sum[2]++;
    else if (n.type === "PseudoElementSelector") sum[2]++;
    else if (n.type === "PseudoClassSelector") {
      if (n.name === "where") return;
      if (["is", "not", "has"].includes(n.name) && n.children) {
        let max = [0, 0, 0];
        cssTree.walk(n, {
          visit: "Selector",
          enter(s) {
            const v = specificity(s);
            if (
              v[0] > max[0] ||
              (v[0] === max[0] &&
                (v[1] > max[1] || (v[1] === max[1] && v[2] > max[2])))
            )
              max = v;
            return cssTree.walk.skip;
          },
        });
        add(max);
      } else sum[1]++;
    }
  });
  return sum;
}
function matchSelector(element, selector) {
  const parts = [],
    combinators = [];
  let group = [];
  selector.children.forEach((n) => {
    if (n.type === "Combinator") {
      parts.push(group);
      group = [];
      combinators.push(n.name);
    } else group.push(n);
  });
  parts.push(group);
  function matchGroup(el, nodes) {
    if (!el) return false;
    let uncertain = false;
    for (const n of nodes) {
      let result = true;
      if (n.type === "TypeSelector")
        result = n.name === "*" || n.name.toLowerCase() === el.tag;
      else if (n.type === "IdSelector") result = el.attrs.id === n.name;
      else if (n.type === "ClassSelector")
        result = (el.attrs.class || "").split(/\s+/).includes(n.name);
      else if (n.type === "AttributeSelector") {
        const name = n.name.name,
          value = el.attrs[name];
        if (value === undefined) result = false;
        else if (n.matcher) {
          let expected = n.value?.value ?? n.value?.name ?? "",
            actual = value;
          if (n.flags === "i") {
            actual = actual.toLowerCase();
            expected = expected.toLowerCase();
          }
          result =
            n.matcher === "="
              ? actual === expected
              : n.matcher === "~="
                ? actual.split(/\s+/).includes(expected)
                : n.matcher === "|="
                  ? actual === expected || actual.startsWith(expected + "-")
                  : n.matcher === "^="
                    ? actual.startsWith(expected)
                    : n.matcher === "$="
                      ? actual.endsWith(expected)
                      : n.matcher === "*="
                        ? actual.includes(expected)
                        : null;
        }
      } else if (n.type === "PseudoClassSelector") {
        if (
          ["first-child", "last-child", "only-child", "empty", "root"].includes(
            n.name,
          )
        ) {
          const siblings = el.parent?.children || [];
          result =
            n.name === "first-child"
              ? siblings[0] === el
              : n.name === "last-child"
                ? siblings.at(-1) === el
                : n.name === "only-child"
                  ? siblings.length === 1
                  : n.name === "root"
                    ? el.tag === "html"
                    : null;
        } else result = null;
      } else result = null;
      if (result === false) return false;
      if (result === null) uncertain = true;
    }
    return uncertain ? null : true;
  }
  function at(el, i) {
    const own = matchGroup(el, parts[i]);
    if (own === false) return false;
    if (i === 0) return own;
    const c = combinators[i - 1],
      siblings = el.parent?.children || [],
      index = siblings.indexOf(el);
    const candidates =
      c === ">"
        ? [el.parent]
        : c === "+"
          ? [siblings[index - 1]]
          : c === "~"
            ? siblings.slice(0, index)
            : c === " "
              ? (() => {
                  let a = [],
                    p = el.parent;
                  while (p) {
                    a.push(p);
                    p = p.parent;
                  }
                  return a;
                })()
              : [];
    let uncertain = own === null;
    for (const candidate of candidates) {
      if (!candidate) continue;
      const result = at(candidate, i - 1);
      if (result === true) return own;
      if (result === null) uncertain = true;
    }
    return uncertain ? null : false;
  }
  return at(element, parts.length - 1);
}
