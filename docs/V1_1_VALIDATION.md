# STYLE FORGE v1.1 검증 보고서

## 실행한 검사

- `npm run build`: 로컬 Worker 번들 및 타사 라이선스 생성 성공.
- `STYLE_FORGE_SAMPLE=<첨부 백업의 로컬 경로> npm test`: 12개 테스트 통과, 실패·skip 없음.
- `STYLE_FORGE_SAMPLE=<첨부 백업의 로컬 경로> npm run test:browser`: 실제 Chromium에서 v1.0 회귀와 v1.1 UI 검증 통과.
- GitHub에는 원본 백업과 운영 쇼핑몰 파일을 커밋하지 않는다.

자동화 검사는 HTML/CSS/JS 분류, module/import의 경로·줄 번호, 인라인 소스 위치, 중복 선택자와 미디어쿼리, 태그형 하위 선택자(`.moreBtn a`)의 구조 매핑, JS 이벤트·위임·Swiper·클래스 변경, 구문 실패의 추정 표시를 포함한다. ZIP/TAR.GZ/폴더 로더, 잘린 ZIP·상위 경로·과대 소스 거부, TAR 체크섬도 확인했다.

브라우저 검사는 폴더·ZIP·실제 TAR.GZ 업로드, 파일 필터·선택자 검색, 결과에서 파일/줄 이동, import 대상 이동, JS 이벤트 조회, JSON/소스 다운로드, 실패 후 이전 결과 유지, 390px 모바일 가로 넘침을 확인했다. 스킨의 악성 테스트 script/img를 실행하거나 요청하지 않았다. 브라우저 pageerror와 외부 네트워크 요청은 0건이었다.

v1.0 색상·폰트·카드 미리보기, LocalStorage 저장 후 재접속/불러오기, 클립보드·CSS 다운로드, 탭 전환 후 토큰 상태 유지도 통과했다. 기존 `app.js`는 변경하지 않았다.

## 실제 첨부 백업 결과

`ettes2023_s2_231016123511_d_mobile1_H.tar.gz`:

| 항목 | 결과 |
| --- | ---: |
| 원본 TAR 항목 (파일·폴더·링크) | 543 |
| 일반 파일 | 429 |
| 분석 소스 | 427 |
| HTML / CSS / JS | 206 / 171 / 50 |
| 소스 위치가 있는 HTML 요소 | 16,492 |
| 고유 class / id | 1,390 / 479 |
| CSS 선택자 레코드 (중복 포함) | 6,132 |
| HTML/module/파일 참조 | 1,626 |
| JS 선택자·이벤트 레코드 | 1,737 |
| 경고 | 40 |

`.main_prd_tab .tab_list .prd_tab_btn`은 `mobile1/mill/css/layout.css:25`로 연결되며 6개 정적 HTML 요소가 일치한다. `mobile1/index.html:25`의 `@import(/mill/layout/main_prd_tab.html)` 대상도 확인했다. `.prd_tab_btn`의 click 등록은 `mobile1/mill/js/basic.js:327`에서 추출했다.

### 경고의 원인

- 31개 심볼릭 링크: 백업 밖의 카페24 서버 내부 리소스 경로를 가리킨다. 파일 내용이 제공되지 않아 읽지 않았으며 대상에 접근하지 않았다.
- 1개 JS 파일: UTF-8 디코딩 실패로 EUC-KR을 추정했다.
- 7개 CSS 파싱 경고: 기존 소스의 레거시/비표준 구문을 파서가 복구하면서 발생했다. 위치를 표시하고 해당 소스를 확인할 수 있다.
- 1개 요약 경고: 52개 선택자의 HTML 일치가 200개를 넘어서 처음 200개 연결과 전체 일치 수를 제공한다.

## 한계와 다음 단계

실제 운영 쇼핑몰의 DOM·CSS 적용·Swiper 동작을 검증한 결과는 아니다. 백업의 모든 선택자가 페이지에 적용된다고 주장하지 않는다. v1.1은 읽기 전용 정적 분석이며 import 조합 DOM과 카페24 모듈 실행, JS 변수 추적, runtime cascade 계산은 후속 v1.2 범위이다. 공유 대화 링크는 HTTP CONNECT 403으로 읽을 수 없었으므로 현재 요청과 첨부 백업을 근거로 구현했다.
