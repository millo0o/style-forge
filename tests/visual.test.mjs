import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import {
  emptyState,
  updateProperty,
  exportCSS,
  History,
  validateState,
  readReport,
  mapSources,
} from "../visual/model.js";
const doc = {
  querySelectorAll(s) {
    if (s.includes("{")) throw Error("invalid");
    return [];
  },
  defaultView: {
    CSS: {
      supports(name, value) {
        return !value.includes("bad");
      },
    },
  },
};
test("CSS patches keep original declarations untouched and support responsive overrides", () => {
  const initial = emptyState();
  let state = updateProperty(initial, ".title", "all", "font-size", "32px");
  state = updateProperty(state, ".title", "mobile", "font-size", "24px");
  state = updateProperty(
    state,
    ".button",
    "all",
    "background-color",
    "#112233",
  );
  const css = exportCSS(state);
  assert.match(css, /font-size: 32px !important/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /font-size: 24px/);
  assert.equal(initial.changes.length, 0);
  assert.equal(
    updateProperty(state, ".title", "mobile", "font-size", null).changes.length,
    2,
  );
  assert.doesNotMatch(exportCSS({ ...state, important: false }), /!important/);
});
test("history coalesces live changes, supports undo/redo and clears redo after a new edit", () => {
  const h = new History();
  h.commit(
    updateProperty(h.current, ".x", "all", "font-size", "20px"),
    "size",
    1000,
  );
  h.commit(
    updateProperty(h.current, ".x", "all", "font-size", "21px"),
    "size",
    1100,
  );
  assert.equal(h.states.length, 2);
  assert.equal(h.undo().changes.length, 0);
  assert.equal(h.redo().changes[0].properties["font-size"], "21px");
  h.undo();
  h.commit(
    updateProperty(h.current, ".x", "all", "color", "#000000"),
    "color",
    2000,
  );
  assert(!h.canRedo);
  assert.equal(h.current.changes[0].properties.color, "#000000");
});
test("imported edit JSON accepts only supported CSS, selectors and breakpoint scopes", () => {
  const good = updateProperty(
    emptyState(),
    ".title",
    "all",
    "font-size",
    "30px",
  );
  assert.deepEqual(validateState(good, doc), good);
  for (const change of [
    { selector: "x{}", media: "all", properties: {} },
    { selector: ".x", media: "arbitrary", properties: {} },
    {
      selector: ".x",
      media: "all",
      properties: { background: "url(https://evil)" },
    },
    { selector: ".x", media: "all", properties: { color: "red;display:none" } },
  ])
    assert.throws(() => validateState({ changes: [change] }, doc));
  assert.throws(() => validateState({ changes: new Array(201).fill({}) }, doc));
});
test("analysis mapping uses actual DOM matching and never claims a winning stylesheet", () => {
  const report = readReport({
    files: [],
    rules: [
      {
        selector: ".title",
        file: "mobile1/css/main.css",
        line: 25,
        context: "@media (max-width:700px)",
      },
      { selector: ".other", file: "css/x.css", line: 2 },
      { selector: ".title", file: "../unsafe.css", line: 1 },
    ],
  });
  const matches = mapSources({ matches: (s) => s === ".title" }, report);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].line, 25);
  assert.match(matches[0].status, /미확인/);
  assert.throws(() => readReport({ rules: [] }));
});
test("MV3 action injects only into the activated tab and handles restricted pages", async () => {
  const calls = [];
  let action;
  const chrome = {
    runtime: { id: "test", onMessage: { addListener() {} } },
    action: {
      onClicked: {
        addListener(fn) {
          action = fn;
        },
      },
      async setBadgeText(v) {
        calls.push(["badge", v]);
      },
      async setBadgeBackgroundColor() {},
      async setTitle(v) {
        calls.push(["title", v]);
      },
    },
    scripting: {
      async executeScript(v) {
        calls.push(["script", v]);
      },
    },
  };
  vm.runInNewContext(await readFile("extension/background.js", "utf8"), {
    chrome,
  });
  await action({ id: 7 });
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), [
    "script",
    { target: { tabId: 7 }, files: ["content.js"] },
  ]);
  chrome.scripting.executeScript = async () => {
    throw Error("restricted");
  };
  await action({ id: 8 });
  assert(calls.some(([k, v]) => k === "badge" && v.text === "!"));
});
test("extension CSS API removes old patches and inserts USER origin CSS; rejects foreign messages", async () => {
  const calls = [];
  let handler;
  const chrome = {
    runtime: {
      id: "own",
      onMessage: {
        addListener(fn) {
          handler = fn;
        },
      },
    },
    action: { onClicked: { addListener() {} } },
    scripting: {
      async removeCSS(v) {
        calls.push(["remove", v]);
      },
      async insertCSS(v) {
        calls.push(["insert", v]);
      },
    },
  };
  vm.runInNewContext(await readFile("extension/background.js", "utf8"), {
    chrome,
  });
  const response = await new Promise((r) =>
    assert.equal(
      handler(
        { type: "style-forge-css", previousCSS: ".old{}", css: ".new{}" },
        { id: "own", tab: { id: 1 }, frameId: 0 },
        r,
      ),
      true,
    ),
  );
  assert.equal(response.ok, true);
  assert.equal(calls[0][0], "remove");
  assert.equal(calls[1][1].origin, "USER");
  assert.equal(calls[1][1].target.tabId, 1);
  assert.equal(
    handler(
      { type: "style-forge-css", css: "x", previousCSS: "" },
      { id: "foreign", tab: { id: 1 } },
      () => {},
    ),
    undefined,
  );
});
