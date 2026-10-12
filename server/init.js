import { Store } from "./store.js";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
if (!process.stdin.isTTY) {
  console.error(
    "담당자 계정 생성은 Mac 터미널에서 실행하세요. 비밀번호는 비공개 입력합니다.",
  );
  process.exit(1);
}
const store = await new Store(
  process.env.SF_DATA_DIR || resolve(homedir(), ".style-forge/server"),
).init();
if (store.data.users.length) {
  console.error("초기 계정이 이미 있습니다. 로그인 후 계정을 관리하세요.");
  process.exit(1);
}
const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const email = await prompt.question("담당자 이메일: "),
  name = await prompt.question("이름: ");
prompt.close();
process.stdout.write("비밀번호 (12자 이상, 표시되지 않음): ");
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
await store.addUser({ email, name, password, role: "reviewer" });
console.log("담당자 계정 생성 완료. npm run server로 실행하세요.");
