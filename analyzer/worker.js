import { loadFiles } from "./archive.js";
import { analyze } from "./engine.js";
self.onmessage = async ({ data }) => {
  try {
    self.postMessage({
      type: "progress",
      message: "파일과 압축 구조를 읽는 중…",
    });
    const loaded = await loadFiles(data);
    self.postMessage({
      type: "progress",
      message: `${loaded.files.length}개 소스의 HTML · CSS · JS 관계를 분석하는 중…`,
    });
    const result = analyze(loaded.files, loaded.warnings);
    result.totalFiles = loaded.totalFiles;
    self.postMessage({ type: "result", result });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error.message || String(error),
    });
  }
};
