# v1.3 협업 검토·승인 적용 검증

## 통과한 검사

- `npm run build`: 기존 Worker/편집 코어, 확장 자체 검토함과 ZIP, Mac Node 적용 프로그램 및 ZIP 생성. basic-ftp 라이선스 포함.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm test`: 27개 테스트 통과, 실패·skip 없음. 기존 스킨 파서와 편집기, 실제 HTTP 로그인/RBAC/CORS/세션, 프로젝트 접근, CSS/URL 검증, 요청 재수정·버전 충돌, 승인 서명, local apply/backup/hash/rollback을 포함한다.
- `npm run test:collaboration`: 실제 Chromium에서 클라이언트/담당자 로그인, 두 페이지 제출, 페이지·전후 값 조회, 담당자 전용 검토, 한 항목 승인·다른 항목 재수정, 홈페이지 변경 영역 표시, 승인된 항목만 다운로드, 임시 local 폴더 반영, 담당자 영수증 기록, 재수정 제출과 모바일 레이아웃을 확인했다.
- `npm run test:ftp`: pyftpdlib 기반 127.0.0.1 테스트 FTP 서버에 실제 제어/data 연결을 사용했다. 로그인/list/read-only prepare/upload/rename/hash/backup/rollback 통과. 테스트 전용 계정과 임시 디렉터리만 사용했다.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm run test:visual`: v1.2 클릭 편집·scope·media·전후 비교·undo/redo·저장/JSON·copy/download·정리·스킨 매핑 회귀를 확인한다.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm run test:browser`: v1.0 생성기와 v1.1 폴더/ZIP/TAR.GZ·검색·파일 줄 매핑·JSON 내보내기 회귀를 확인한다.

테스트 백업·DB·키·영수증은 임시 폴더에 생성하고 제거했다. 실제 사용자 계정, 스킨 원본, FTP 비밀번호는 GitHub에 반영하지 않는다.

## 검증하지 않은 것

- 별도 공개 협업 서버와 실제 클라이언트 접속: 배포 계정과 HTTPS 주소가 아직 없다. 제공된 ‘서버’는 카페24 쇼핑몰 HTML 스킨이다.
- 운영 Cafe24 FTP·FTPS: 호스트·계정·대상 스킨이 제공되지 않았고 접속하지 않았다. FTPS는 인증서 검증을 유지하는 설정이지만 실제 인증서/서버와의 연결은 미검증이다. SFTP는 미구현이다.
- 실제 Mac의 AppleScript 파일 선택·Terminal 입력·Gatekeeper: Linux 클라우드에서는 실행하지 않았다. Node 적용 로직은 local/FTP fixture로 검증했고 Mac launch script는 문법 검사한다.
- 실제 카페24 @js 연결 후 loader/CSP/모듈의 페이지 적용: 테스트 스킨에서 담당자 확인이 필요하다. 원본 CSS 자동 수정 대신 별도 페이지 CSS 연결을 사용한다.
- Chrome unpacked 확장 설치: 기존 관리 정책 차단이 지속된다. 공통 편집 코어와 background API 계약은 테스트했으며 실제 확장 runtime은 별도 Chrome 환경에서 확인해야 한다.

## 판정과 데이터 의미

로컬 체험은 역할 전환이 가능한 예제이며 실제 인증·클라이언트 제출 서비스가 아니다. 서버 모드에서만 로그인과 RBAC를 수행한다. 승인은 배포 성공이 아니다. applied 기록은 담당자가 적용 영수증을 확인해 보고한 상태이며 서버가 독립적으로 FTP 쓰기를 증명하지 않는다.

수정 전 값은 대표 요소를 편집하기 전에 관찰한 값이다. 같은 class의 다른 요소나 다른 viewport의 값과 같다고 주장하지 않는다. 위치 기반 selector, inline !important, 동적 구조와 query 값은 실제 페이지에서 검토해야 한다. 영수증 버전이 바뀌면 상태 기록을 거부하고 확인을 요구한다.
