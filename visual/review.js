import { validateItems, pageURL } from "../collaboration/schema.js";
export function createReviewOverlay(doc, root, onSelect) {
  let records = [],
    visible = true;
  const container = doc.createElement("div");
  container.className = "review-overlays";
  root.append(container);
  return {
    load(packet) {
      if (
        !["style-forge-review-v1", "style-forge-submission-v1"].includes(
          packet?.format,
        )
      )
        throw Error("담당자 검토함의 홈페이지 표시 JSON을 선택하세요.");
      const normalized = validateItems(
        packet.items,
        new URL(packet.items[0]?.pageUrl).origin,
        (p, v) => doc.defaultView.CSS.supports(p, v),
      );
      const current = pageURL(doc.defaultView.location.href);
      const items = normalized
        .map((i, n) => ({ ...i, status: packet.items[n].status || "pending" }))
        .filter((i) => i.pageUrl === current);
      if (!items.length)
        throw Error(
          "현재 페이지에 해당하는 수정 요청이 없습니다. JSON의 페이지 주소를 확인하세요.",
        );
      records = [];
      container.replaceChildren();
      let missing = 0,
        total = 0;
      for (const item of items) {
        let matches = [];
        try {
          matches = [...doc.querySelectorAll(item.selector)].filter(
            (e) => e.tagName !== "STYLE-FORGE-EDITOR",
          );
        } catch {}
        if (!matches.length) missing++;
        total += matches.length;
        for (const element of matches.slice(0, 10)) {
          if (records.length >= 100) break;
          const box = doc.createElement("div");
          box.className = "review-mark";
          const badge = doc.createElement("button");
          badge.className = "review-badge";
          badge.textContent =
            (item.status === "approved"
              ? "승인"
              : item.status === "applied"
                ? "적용 완료"
                : item.status === "revision_requested"
                  ? "재수정 요청"
                  : "수정 요청") +
            " · " +
            item.label;
          badge.title = item.selector;
          badge.addEventListener("click", () => onSelect(element));
          box.append(badge);
          container.append(box);
          records.push({ element, box });
        }
      }
      return { items, total, missing, displayed: records.length };
    },
    draw() {
      for (const { element, box } of records) {
        if (!visible || !element.isConnected) {
          box.hidden = true;
          continue;
        }
        const r = element.getBoundingClientRect();
        box.hidden = r.width === 0 && r.height === 0;
        Object.assign(box.style, {
          left: r.left + "px",
          top: r.top + "px",
          width: r.width + "px",
          height: r.height + "px",
        });
      }
    },
    toggle() {
      visible = !visible;
      container.hidden = !visible;
      this.draw();
      return visible;
    },
    clear() {
      records = [];
      container.remove();
    },
  };
}
