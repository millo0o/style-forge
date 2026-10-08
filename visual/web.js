import { mountEditor } from "../vendor/visual-editor.js";
const frame = document.getElementById("visual-demo-frame");
let editor;
function mount() {
  editor?.destroy();
  editor = mountEditor(frame.contentDocument, {
    onClose() {
      document.getElementById("restart-editor").hidden = false;
    },
  });
  document.getElementById("restart-editor").hidden = false;
}
frame.addEventListener("load", mount);
if (
  frame.contentDocument?.readyState === "complete" &&
  frame.contentDocument.body
)
  mount();
document.getElementById("restart-editor").addEventListener("click", () => {
  if (editor?.host?.isConnected) {
    editor.host.shadowRoot.querySelector(".panel").scrollTop = 0;
    return;
  }
  mount();
});
for (const button of document.querySelectorAll("[data-visual-device]"))
  button.addEventListener("click", () => {
    frame.style.width =
      button.dataset.visualDevice === "mobile" ? "min(390px, 100%)" : "100%";
    for (const b of document.querySelectorAll("[data-visual-device]")) {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    }
  });
document.getElementById("open-shop").addEventListener("click", () => {
  const status = document.getElementById("visual-web-status");
  try {
    const url = new URL(document.getElementById("shop-url").value.trim());
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw Error();
    window.open(url.href, "_blank", "noopener,noreferrer");
    status.textContent =
      "쇼핑몰 탭에서 STYLE FORGE 확장 프로그램 아이콘을 눌러 편집기를 여세요.";
  } catch {
    status.textContent = "https://로 시작하는 쇼핑몰 주소를 입력하세요.";
  }
});
