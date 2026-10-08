import { Unzip, UnzipInflate, Gunzip } from "fflate";
export const LIMITS = Object.freeze({
  archive: 50 * 1024 * 1024,
  total: 100 * 1024 * 1024,
  file: 5 * 1024 * 1024,
  files: 10000,
});
export function safePath(name) {
  if (
    typeof name !== "string" ||
    name.includes("\0") ||
    name.includes("\\") ||
    name.startsWith("/") ||
    /^[A-Za-z]:/.test(name)
  )
    throw Error("안전하지 않은 파일 경로: " + name);
  const parts = name.split("/").filter((p) => p && p !== ".");
  if (parts.includes(".."))
    throw Error("상위 폴더 경로는 허용되지 않습니다: " + name);
  return parts.join("/");
}
const sourceType = (path) =>
  /\.(html?|css|js|mjs|cjs)$/i.exec(path)?.[1].toLowerCase();
export function decodeSource(bytes) {
  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      encoding: "UTF-8",
    };
  } catch {
    return {
      text: new TextDecoder("euc-kr").decode(bytes),
      encoding: "EUC-KR 추정",
    };
  }
}
function collector() {
  const files = [],
    warnings = [];
  let total = 0,
    count = 0;
  const seen = new Set();
  return {
    files,
    warnings,
    add(name, bytes) {
      const path = safePath(name);
      if (!path) return;
      if (seen.has(path)) throw Error("중복 파일 경로: " + path);
      seen.add(path);
      if (++count > LIMITS.files)
        throw Error("파일 수 제한(10,000개)을 초과했습니다.");
      total += bytes.length;
      if (total > LIMITS.total)
        throw Error("압축 해제 크기 제한(100 MB)을 초과했습니다.");
      const ext = sourceType(path);
      if (!ext) return;
      if (bytes.length > LIMITS.file)
        throw Error("소스 파일 크기 제한(5 MB)을 초과했습니다: " + path);
      const decoded = decodeSource(bytes);
      files.push({
        path,
        type: ext.startsWith("htm") ? "html" : ext === "css" ? "css" : "js",
        content: decoded.text,
        encoding: decoded.encoding,
      });
      if (decoded.encoding !== "UTF-8")
        warnings.push(path + ": EUC-KR로 추정하여 읽었습니다.");
    },
    get count() {
      return count;
    },
  };
}
// Central directory validation catches truncated/encrypted/multi-volume ZIPs before
// decompression. No files are extracted to disk.
function inspectZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p--) {
    if (
      view.getUint32(p, true) === 0x06054b50 &&
      p + 22 + view.getUint16(p + 20, true) === bytes.length
    ) {
      end = p;
      break;
    }
  }
  if (end < 0) throw Error("잘린 ZIP 파일 또는 ZIP 종료 정보 누락");
  const count = view.getUint16(end + 10, true),
    start = view.getUint32(end + 16, true),
    size = view.getUint32(end + 12, true);
  if (
    view.getUint16(end + 4, true) ||
    view.getUint16(end + 6, true) ||
    view.getUint16(end + 8, true) !== count
  )
    throw Error("분할 ZIP은 지원하지 않습니다.");
  if (count === 65535 || start === 0xffffffff || size === 0xffffffff)
    throw Error("ZIP64는 지원하지 않습니다. 일반 ZIP으로 다시 압축하세요.");
  if (count > LIMITS.files) throw Error("ZIP 항목 수 제한을 초과했습니다.");
  if (start + size !== end) throw Error("ZIP 디렉터리 크기 오류");
  let p = start,
    total = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > end || view.getUint32(p, true) !== 0x02014b50)
      throw Error("ZIP 디렉터리 손상");
    if (view.getUint16(p + 8, true) & 1)
      throw Error("암호화 ZIP은 지원하지 않습니다.");
    total += view.getUint32(p + 24, true);
    if (total > LIMITS.total)
      throw Error("ZIP 압축 해제 크기 제한(100 MB)을 초과했습니다.");
    p +=
      46 +
      view.getUint16(p + 28, true) +
      view.getUint16(p + 30, true) +
      view.getUint16(p + 32, true);
  }
  if (p !== end) throw Error("ZIP 항목 크기 오류");
  return count;
}
function unzip(bytes, c) {
  const expectedCount = inspectZip(bytes);
  let completed = 0;
  let failure,
    expanded = 0,
    count = 0;
  const unzipper = new Unzip((entry) => {
    try {
      safePath(entry.name);
      if (++count > LIMITS.files)
        throw Error("ZIP 항목 수 제한을 초과했습니다.");
      if (entry.originalSize > LIMITS.total)
        throw Error("ZIP 항목 크기가 너무 큽니다.");
      let chunks = [],
        size = 0;
      entry.ondata = (err, chunk, final) => {
        if (err) {
          failure = err;
          return;
        }
        size += chunk.length;
        expanded += chunk.length;
        if (sourceType(entry.name) && size > LIMITS.file) {
          failure = Error(
            "소스 파일 크기 제한(5 MB)을 초과했습니다: " + entry.name,
          );
          entry.terminate();
          return;
        }
        if (expanded > LIMITS.total) {
          failure = Error("ZIP 압축 해제 크기 제한(100 MB)을 초과했습니다.");
          entry.terminate();
          return;
        }
        chunks.push(chunk);
        if (final) completed++;
        if (final && !entry.name.endsWith("/")) {
          try {
            const data = new Uint8Array(size);
            let pos = 0;
            for (const part of chunks) {
              data.set(part, pos);
              pos += part.length;
            }
            c.add(entry.name, data);
          } catch (e) {
            failure = e;
          }
        }
      };
      entry.start();
    } catch (e) {
      failure = e;
    }
  });
  unzipper.register(UnzipInflate);
  for (let p = 0; p < bytes.length; p += 65536) {
    unzipper.push(bytes.subarray(p, p + 65536), p + 65536 >= bytes.length);
    if (failure) throw failure;
  }
  if (completed !== expectedCount)
    throw Error("ZIP의 일부 파일을 읽지 못했습니다.");
}
function gunzip(bytes) {
  let total = 0,
    chunks = [];
  const g = new Gunzip((chunk) => {
    total += chunk.length;
    if (total > LIMITS.total + LIMITS.files * 1024)
      throw Error("GZIP 압축 해제 크기 제한을 초과했습니다.");
    chunks.push(chunk);
  });
  for (let p = 0; p < bytes.length; p += 65536)
    g.push(bytes.subarray(p, p + 65536), p + 65536 >= bytes.length);
  const result = new Uint8Array(total);
  let p = 0;
  for (const part of chunks) {
    result.set(part, p);
    p += part.length;
  }
  return result;
}
function tar(bytes, c) {
  const decoder = new TextDecoder();
  const string = (b) => decoder.decode(b).split("\0")[0];
  let longName = "",
    pax = {},
    entries = 0;
  for (let p = 0; p + 512 <= bytes.length; ) {
    const h = bytes.subarray(p, p + 512);
    if (h.every((b) => b === 0)) break;
    if (++entries > LIMITS.files * 2)
      throw Error("TAR 항목 수 제한을 초과했습니다.");
    const sizeString = string(h.subarray(124, 136)).trim();
    if (!/^[0-7]+$/.test(sizeString))
      throw Error("지원되지 않는 TAR 크기 형식");
    const size = parseInt(sizeString, 8);
    const expected = parseInt(string(h.subarray(148, 156)).trim(), 8);
    const actual = h.reduce(
      (sum, b, i) => sum + (i >= 148 && i < 156 ? 32 : b),
      0,
    );
    if (actual !== expected)
      throw Error("TAR 헤더 체크섬이 일치하지 않습니다.");
    if (p + 512 + size > bytes.length) throw Error("잘린 TAR 파일입니다.");
    const body = bytes.subarray(p + 512, p + 512 + size),
      type = String.fromCharCode(h[156] || 48);
    let name = string(h.subarray(0, 100)),
      prefix = string(h.subarray(345, 500));
    if (prefix) name = prefix + "/" + name;
    if (type === "L") {
      longName = string(body);
    } else if (type === "K") {
      /* GNU long link target metadata; links are never followed. */
    } else if (type === "x" || type === "g") {
      for (const match of string(body).matchAll(/\d+ ([^=]+)=([^\n]*)\n/g))
        pax[match[1]] = match[2];
    } else {
      name = pax.path || longName || name;
      safePath(name);
      if (type === "0" || type === "7") c.add(name, body);
      else if (type !== "5")
        c.warnings.push(name + ": 링크 또는 특수 TAR 항목을 읽지 않았습니다.");
      longName = "";
      pax = {};
    }
    p += 512 + Math.ceil(size / 512) * 512;
  }
}
export async function loadFiles(input) {
  const c = collector();
  if (input.kind === "folder") {
    let size = 0;
    for (const file of input.files) {
      size += file.size;
      if (size > LIMITS.total)
        throw Error("폴더 크기 제한(100 MB)을 초과했습니다.");
      const path = safePath(file.webkitRelativePath || file.name);
      if (sourceType(path)) {
        if (file.size > LIMITS.file)
          throw Error("소스 파일은 5 MB 이하여야 합니다.");
        c.add(path, new Uint8Array(await file.arrayBuffer()));
      } else c.add(path, new Uint8Array());
    }
  } else {
    const file = input.file;
    if (file.size > LIMITS.archive)
      throw Error("압축파일은 50 MB 이하여야 합니다.");
    const data = new Uint8Array(await file.arrayBuffer());
    if (/\.zip$/i.test(file.name)) unzip(data, c);
    else if (/\.(tar\.gz|tgz)$/i.test(file.name)) tar(gunzip(data), c);
    else if (/\.tar$/i.test(file.name)) tar(data, c);
    else throw Error("ZIP, TAR, TAR.GZ 파일을 선택하세요.");
  }
  if (!c.files.length) throw Error("분석할 HTML/CSS/JS 파일이 없습니다.");
  return {
    files: c.files.sort((a, b) => a.path.localeCompare(b.path)),
    warnings: c.warnings,
    totalFiles: c.count,
  };
}
