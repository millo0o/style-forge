# v1.2 검증 결과

## 통과

- `npm run build`: 분석기, 공유 비주얼 코어, MV3 content 번들 및 독립 설치 ZIP 생성.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm test`: 18개 테스트 통과, 실패·skip 없음. 기존 분석기와 patch/반응형 CSS/undo-redo/JSON 검증/DOM 매핑/MV3 API 계약을 포함한다.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm run test:visual`: 실제 Chromium에서 선택·폰트/색상/여백 편집, 같은 class의 여러 요소, 모바일 조건, 원본 비교, undo/redo, computed CSS, 소스 매핑, 클립보드/다운로드, 저장/복원/JSON 검증, 종료 시 원본 복원, 모바일 가로 넘침, 설치 ZIP 구조를 확인했다. 외부 요청과 pageerror는 없었다.
- 실제 백업의 CSS를 실행하지 않고, 개발자가 만든 샘플 DOM에 예시 class 구조를 구성한 뒤 백업 인덱스와 연결했다. `mobile1/mill/css/layout.css:25`의 `.main_prd_tab .tab_list .prd_tab_btn` 후보를 패널에서 확인했다.
- `STYLE_FORGE_SAMPLE=<제공 백업> npm run test:browser`: v1.0 생성기 및 v1.1 폴더/ZIP/TAR.GZ 분석 UI 회귀 통과. 기존 app.js/style.css는 유지한다.

## 실행하지 못한 실제 확장 검증

`npm run test:extension`은 Chromium의 `Extensions.loadUnpacked`에 다음 응답을 받았다:

> Loading of unpacked extensions is disabled by the administrator.

관리 정책을 변경하거나 우회하지 않았다. 확장 브라우저 테스트는 **SKIP**이며 통과로 취급하지 않는다. 공통 코어의 실제 DOM 테스트와 background action/CSS API 테스트는 통과했지만 실제 확장 설치, activeTab 권한 부여, Chrome USER stylesheet 주입, chrome.storage의 실제 런타임과 사이트 CSP 호환성은 사용자의 Chrome에서 추가 검증해야 한다. 테스트가 가능한 환경에서는 `npm run test:extension`으로 재확인할 수 있다. 자동화용 임시 manifest에만 loopback host 권한을 추가하며 공개 ZIP은 activeTab/scripting/storage만 사용한다.

## 검증 범위 밖

실제 운영 카페24 주소·FTP 자격 증명은 제공되지 않았고 운영 사이트에 연결하거나 업로드하지 않았다. 스킨 인덱스와 현재 사이트 버전의 일치, iframe/Shadow DOM 내부, 상품 동적 재배치와 위치 selector의 지속성, 원격 CSS의 최종 cascade는 실제 페이지에서 검토해야 한다. FTP 읽기/쓰기와 기존 소스 자동 수정은 아직 구현하지 않았다. 배포용 CSS는 원본을 덮어쓰지 않는 별도 override 코드이다.
