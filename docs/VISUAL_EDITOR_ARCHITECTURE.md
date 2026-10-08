# v1.2 비주얼 편집기

## 공유 코어

- `visual/model.js`: 허용 CSS 속성, all/mobile/desktop 범위, patch 상태와 검증, CSS 직렬화, 단일/동일 class 선택자, undo/redo, 스킨 인덱스의 DOM 매칭.
- `visual/core.js` + `editor.css`: Shadow DOM 안의 흰색 편집 패널. 클릭 선택·상위 구조·computed style·CSSOM 조회·속성 입력·비교·내보내기·로컬 저장·정리.
- `visual/web.js` + `demo.html`: 개발자가 만든 샘플의 같은 출처 iframe에 공유 코어를 적용한다. 사용자 스킨이나 외부 사이트를 iframe으로 실행하지 않는다.
- `extension/manifest.json`: Manifest V3, activeTab/scripting/storage 권한. 항상 실행되는 content script와 전체 사이트 host 권한은 없다.
- `extension/background.js`: action으로 명시적 실행한 탭에 content bundle 주입. content의 요청을 받아 USER origin 임시 CSS를 삽입/제거한다. sender의 extension ID와 tab/frame을 확인한다.
- `extension/content-entry.js`: 공유 코어와 chrome.storage, 직렬 CSS 적용 큐를 연결한다. 패널이 이미 열려 있으면 중복 생성하지 않는다.
- `scripts/build.mjs`: 웹 ESM bundle, 확장 IIFE bundle, 독립 설치용 ZIP을 생성한다. ZIP에는 manifest/background/content/README만 포함하며 소스 저장소의 node_modules는 필요 없다.

## 임시 편집과 원본 보호

상태는 `{important, changes:[{selector,media,properties}]}`이며 원본 stylesheet/HTML을 쓰지 않는다. 웹 체험은 별도 style 요소를 사용한다. 확장은 Chrome scripting API로 USER CSS를 적용하여 페이지의 기존 inline 스타일에도 임시 우선순위를 부여한다. 원본 비교는 patch를 해제하며 닫기도 제거한다. 실제 사이트 CSSOM와 inline important를 수정하지 않는다. 내보낸 CSS는 AUTHOR stylesheet로 적용되므로 인라인 !important는 별도 원본 검토가 필요하다.

변경 범위는 기본 단일 요소, 명시적 선택 시 같은 class의 요소로 바뀐다. 위치 기반 선택자는 DOM 변경에 취약하다고 표시한다. 여러 patch가 겹치면 CSS 명시도·순서가 적용되므로 범위별 기존 변경을 검토해야 한다. selected element가 제거되면 편집 입력을 비활성화하고 다시 선택하도록 안내한다. 선택 모드를 끄면 페이지의 링크·버튼을 정상적으로 사용한다.

패널은 실제 크기/색상/폰트 계산값을 보여준다. 외부 stylesheet의 규칙 조회는 CORS로 실패할 수 있으며 차단 수를 표시한다. CSSOM에서 일치하는 규칙을 나열하더라도 cascade 최종 우승을 단정하지 않는다.

## 스킨 분석 연결

분석기가 내보내는 가벼운 비주얼 인덱스는 `{files,rules:[{selector,file,line,context}]}`이다. 전체 v1.1 보고서도 읽을 수 있다. 현재 요소의 `matches(selector)` 결과를 사용해 파일·줄 후보를 표시한다. 파일을 실제 페이지와 동일 버전이라고 검증하지 않으며, 미디어·동적 DOM·다른 스킨 루트가 있을 수 있으므로 실제 적용 위치를 단정하지 않는다. inline CSS/중복 선택자도 각각 표시한다.

소스 본문을 확장에 전달할 필요가 없고 서버로 전송하지 않는다. JSON은 50 MB, patch는 200개 범위까지 제한한다. import에서 허용 속성·선택자·media·CSS.supports를 검사하며 url()·선언 탈출을 거부한다. 패널은 소스를 textContent로 표시한다.

## 설치와 제한

현재 설치는 ZIP을 풀어 Chrome 개발자 모드에서 로드하는 방식이다. 웹 스토어 게시/서명/자동 업데이트는 하지 않았다. Chrome 내부·스토어·PDF 등 제한 페이지, iframe과 Shadow DOM 내부의 선택은 지원하지 않는다. 확장 변경은 재빌드 후 재설치/확장 새로고침과 쇼핑몰 페이지 새로고침이 필요하다.
