# v1.3 협업과 승인 적용

## 구조

- `collaboration/schema.js`: URL/query 정규화, 안전한 CSS 변경 항목, 요청 요약.
- `collaboration/ui.js` + `workspace.html` + `style.css`: 체험/서버 모드, 로그인, 클라이언트 제출, 담당자 목록과 전후 값, 검토·재수정·승인 패키지·적용 영수증.
- `server/app.js`: Node HTTP API, bearer 세션, 역할 검사, 허용 origin, 요청 크기 제한, private 파일 차단.
- `server/store.js`: 사용자 scrypt 해시, 프로젝트별 클라이언트 권한, 요청 버전·검토 이벤트, Ed25519 승인 서명. 변경을 직렬화하고 파일을 원자적으로 교체한다.
- `visual/core.js` + `review.js`: 수정 전 대표값과 메타데이터 기록, 제출 파일, 요청 JSON 미리보기와 고정 위치 영역 표시. 업로드된 HTML/JS는 실행하지 않는다.
- `extension/background.js`: source tab URL을 확인하고 제출 draft를 chrome.storage.session에 넣은 뒤 확장 자체 `review.html`을 연다. 실제 쇼핑몰에 로그인 UI를 넣지 않는다.
- `connector/deploy.js`: 서명·사이트·만료 검사, 읽기 전용 준비, 페이지별 CSS·loader 계획, 백업/hash/적용/복원. local 및 FTP/FTPS transport.
- `connector/cli.js`: macOS 파일 선택과 비공개 비밀번호 입력, 승인 상태 재확인, 담당자의 전후 코드 검토 및 명시적 APPLY.

## API

| 경로 | 권한/기능 |
| --- | --- |
| POST `/api/login`, `/api/logout` | 로그인/세션 폐기 |
| GET `/api/me` | 현재 사용자 |
| GET/POST `/api/users` | 담당자 계정 조회/생성 |
| GET/POST `/api/projects` | 할당 프로젝트 조회 / 담당자 생성 |
| GET/POST `/api/requests` | 허용된 요청 조회 / 클라이언트 제출 |
| GET `/api/requests/:id` | 요청 접근 검사 |
| POST `/api/requests/:id/decisions` | 담당자 항목별 검토 + version 충돌 검사 |
| POST `/api/requests/:id/bundle` | 승인·미적용 항목만 서명 |
| GET `/api/key` | 담당자의 서명 공개키 다운로드 |
| POST `/api/requests/:id/receipt` | 담당자의 현재 승인 항목 적용 확인 기록 |

로그인 토큰은 메모리에만 저장하고 8시간 후 만료한다. 재시작 시 세션도 사라진다. 비밀번호·개인키는 API에 반환하지 않는다. bearer 인증이 없는 웹 폼 요청은 변경할 수 없다. 클라이언트는 자신이 작성하고 할당된 프로젝트의 요청만 읽는다. 담당자는 해당 단일 협업 공간 전체를 관리하는 역할이다. 테넌트별 관리자 분리/사용자 셀프 비밀번호 재설정은 현재 범위가 아니다.

## 승인과 반영의 구분

검토 항목 상태는 pending/approved/rejected/revision_requested/applied이다. 승인했다고 서버가 FTP에 접속하지 않는다. Mac 프로그램이 신뢰하는 공개키로 서명을 확인하며 현재 서버 승인 상태도 FTP 직전에 재확인한다. 고객이 만든 JSON이나 체험 승인에는 운영 반영 서명이 없다.

배포는 기존 CSS를 수정하는 대신 페이지별 override CSS를 생성한다. URL query를 정렬해 같은 의미의 순서는 통일하고 상품/게시판 값은 유지한다. hash 기반 SPA 화면 분리는 지원하지 않는다. 공통 HTML에는 Cafe24 @js 또는 일반 script 연결을 추가한다. 대상 스킨 및 public URL root는 담당자 설정이며 고객이 임의 경로를 지정할 수 없다.

복원은 현재 파일이 기록한 적용 hash와 일치할 때만 진행한다. FTP는 다중 파일 원자적 transaction을 제공하지 않으며 hash 검사와 rename 사이의 외부 동시 쓰기를 완전히 막지 못한다. 작업 중 다른 FTP-simple 업로드를 하지 않고 백업/검토를 수행해야 한다. 알 수 없는 변경을 발견하면 자동으로 덮어쓰지 않는다.

적용 영수증은 담당자 확인 기록이다. 서버가 외부 FTP를 독립 검증하지 않으므로 웹의 applied 상태를 독립적인 배포 성공 증명으로 해석하지 않는다. 라이브 CSS의 cascade/inline important, 동적 DOM/위치 selector, site CSP는 테스트 스킨에서 검토한다.
