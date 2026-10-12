#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then
  echo 'Node.js 22 이상이 필요합니다. https://nodejs.org 에서 설치 후 다시 실행하세요.'
  read -r -p '종료하려면 Enter를 누르세요.'
  exit 1
fi
if [ "$(node -p "Number(process.versions.node.split('.')[0])")" -lt 22 ]; then
  echo 'Node.js 22 이상으로 업데이트하세요.'
  exit 1
fi
node connector.cjs
read -r -p '종료하려면 Enter를 누르세요.'
