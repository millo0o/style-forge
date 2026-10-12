import { checkApproval } from "./approval.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { execFileSync } from "node:child_process";
import {
  LocalTransport,
  FTPTransport,
  prepare,
  apply,
  rollback,
} from "./deploy.js";
async function main() {
  const defaults = resolve(homedir(), ".style-forge"),
    configPath = process.argv[2] || resolve(defaults, "connector.json");
  if (!process.stdin.isTTY) {
    console.error(
      "Mac 터미널에서 실행하세요. 비밀번호는 화면에 표시하지 않습니다.",
    );
    process.exit(1);
  }
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    console.error(
      "connector.json 설정 파일을 먼저 작성하세요. 설치 안내를 참고하세요.",
    );
    process.exit(1);
  }
  config.origin = new URL(config.origin).origin;
  config.publicKey = await readFile(resolve(config.publicKeyFile), "utf8");
  let transport;
  if (config.protocol === "local") transport = new LocalTransport(config.root);
  else {
    process.stdout.write("FTP 비밀번호 (저장하지 않음): ");
    const muted = new Writable({
        write(c, e, cb) {
          cb();
        },
      }),
      secret = createInterface({
        input: process.stdin,
        output: muted,
        terminal: true,
      });
    const password = await secret.question("");
    secret.close();
    process.stdout.write("\n");
    transport = new FTPTransport(config);
    try {
      await transport.connect(password);
    } catch {
      console.error(
        "FTP 연결에 실패했습니다. 주소·포트·보안 방식·계정을 확인하세요.",
      );
      process.exit(1);
    }
  }
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  async function checkCurrentApproval(payload) {
    if (!config.approvalServer) {
      if (config.protocol === "local") return;
      throw Error(
        "실제 FTP 적용에는 approvalServer 설정과 담당자 로그인이 필요합니다.",
      );
    }
    const url = new URL(config.approvalServer);
    if (
      url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      throw Error("협업 서버는 HTTPS 또는 localhost 주소여야 합니다.");
    const email =
      config.reviewEmail ||
      (await prompt.question("협업 서버 담당자 이메일: "));
    process.stdout.write("협업 서버 비밀번호 (저장하지 않음): ");
    const muted = new Writable({
        write(c, e, cb) {
          cb();
        },
      }),
      secret = createInterface({
        input: process.stdin,
        output: muted,
        terminal: true,
      });
    const password = await secret.question("");
    secret.close();
    process.stdout.write("\n");
    await checkApproval(
      config.approvalServer,
      email,
      password,
      payload,
      config.publicKey,
    );
  }

  try {
    const choice = await prompt.question(
      "승인 반영: APPLY / 백업 복원: ROLLBACK : ",
    );
    if (choice === "ROLLBACK") {
      const backup = await prompt.question("백업 폴더 경로: ");
      await rollback(transport, resolve(backup));
      console.log("복원 완료.");
    } else if (choice === "APPLY") {
      let path;
      if (process.platform === "darwin") {
        path = execFileSync(
          "/usr/bin/osascript",
          [
            "-e",
            'POSIX path of (choose file with prompt "담당자가 승인한 style-forge-approved.json 선택")',
          ],
          { encoding: "utf8" },
        ).trim();
      } else path = await prompt.question("승인 JSON 경로: ");
      const bundle = JSON.parse(await readFile(resolve(path), "utf8")),
        plan = await prepare(transport, bundle, config);
      console.log(
        "적용 사이트:",
        plan.payload.origin,
        "요청:",
        plan.payload.title,
      );
      console.log("승인 항목:", plan.payload.items.length);
      for (const f of plan.files) {
        console.log(
          "\n파일:",
          f.path,
          "기존 해시:",
          f.beforeHash || "새 파일",
          "변경 해시:",
          f.afterHash,
        );
        if (f.path === config.layoutPath)
          console.log("공통 레이아웃에 STYLE FORGE loader 연결을 추가합니다.");
      }
      const backup = resolve(defaults, "backups", plan.id);
      await mkdir(backup, { recursive: true, mode: 0o700 });
      await writeFile(
        resolve(backup, "review.txt"),
        plan.files
          .map(
            (f) =>
              `FILE ${f.path}\nBEFORE\n${f.before?.toString("utf8") || "(new)"}\nAFTER\n${f.after.toString("utf8")}`,
          )
          .join("\n\n"),
        { mode: 0o600 },
      );
      console.log("전후 코드 검토 파일:", resolve(backup, "review.txt"));
      const confirm = await prompt.question(
        "전후 코드와 대상 스킨을 확인한 후 APPLY 입력 (다른 입력은 취소): ",
      );
      if (confirm === "APPLY") {
        const receipt = await apply(
          transport,
          plan,
          backup,
          checkCurrentApproval,
        );
        console.log("적용 완료. 백업과 영수증:", backup);
        console.log(
          "담당자 검토함에서 receipt.json을 확인하면 적용 상태를 기록합니다.",
        );
      } else console.log("취소했습니다. 원본은 변경하지 않았습니다.");
    } else console.log("취소했습니다.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    prompt.close();
    await transport.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
