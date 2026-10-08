async function openStyleForge(tab) {
  if (!tab?.id) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    await chrome.action.setTitle({
      tabId: tab.id,
      title: "STYLE FORGE 편집기 열기",
    });
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    await chrome.action.setBadgeBackgroundColor({
      tabId: tab.id,
      color: "#d57e46",
    });
    await chrome.action.setTitle({
      tabId: tab.id,
      title:
        "일반 HTTP/HTTPS 쇼핑몰 페이지에서 실행하세요. 브라우저 설정·스토어·PDF 등 제한 페이지에는 적용할 수 없습니다.",
    });
  }
}
chrome.action.onClicked.addListener(openStyleForge);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message?.type !== "style-forge-css" ||
    sender.id !== chrome.runtime.id ||
    !sender.tab?.id
  )
    return;
  if (
    typeof message.css !== "string" ||
    typeof message.previousCSS !== "string" ||
    message.css.length > 1500000 ||
    message.previousCSS.length > 1500000
  ) {
    sendResponse({ ok: false });
    return;
  }
  (async () => {
    const target = { tabId: sender.tab.id, frameIds: [sender.frameId || 0] };
    if (message.previousCSS)
      await chrome.scripting.removeCSS({
        target,
        css: message.previousCSS,
        origin: "USER",
      });
    if (message.css)
      await chrome.scripting.insertCSS({
        target,
        css: message.css,
        origin: "USER",
      });
    sendResponse({ ok: true });
  })().catch(() => sendResponse({ ok: false }));
  return true;
});
