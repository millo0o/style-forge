import { mountEditor } from "../visual/core.js";
const storage = {
  async get(key) {
    return (await chrome.storage.local.get(key))[key] || null;
  },
  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },
};
let previousCSS = "",
  queue = Promise.resolve();
function applyCSS(css) {
  queue = queue
    .catch(() => {})
    .then(async () => {
      const response = await chrome.runtime.sendMessage({
        type: "style-forge-css",
        previousCSS,
        css,
      });
      if (!response?.ok) throw Error("CSS injection failed");
      previousCSS = css;
    });
  return queue;
}
mountEditor(document, { storage, applyCSS });
