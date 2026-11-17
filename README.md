# 한 줄 설문

한 문항에 여러 사람이 휴대폰·태블릿·노트북에서 응답하는 간단한 웹 프로그램입니다. 설문 링크 하나를 공유하면 응답을 받을 수 있고, 제출 후 현재 결과가 보입니다. 같은 브라우저에서 답을 바꾸면 이전 응답이 교체됩니다.

## 지금 들어 있는 예시

- 질문: **오늘 모임에 참석하시나요?**
- 선택지: **참석해요 / 아직 모르겠어요 / 참석하지 못해요**

질문과 선택지는 [survey.config.js](survey.config.js)에서 바꿀 수 있습니다. 이미 응답을 받은 설문의 질문·선택지를 바꿀 때는 `id`도 새로운 값으로 바꾸세요. 새 설문은 0명부터 시작하며 이전 설문의 저장 데이터는 그대로 남습니다.

## 1. 내 컴퓨터에서 확인하기

PowerShell을 열고 아래 명령을 한 줄씩 실행하세요.

```powershell
cd C:\Users\yp21h\Desktop\asd\survey
npm install
npm run dev
```

터미널에 표시되는 `http://localhost:8788`을 브라우저에서 열면 예시 설문을 볼 수 있습니다. 개발 서버를 끝내려면 터미널에서 `Ctrl+C`를 누르세요. 이 주소는 내 컴퓨터에서만 테스트하는 용도입니다.

## 2. GitHub에 올리고 자동 배포하기

기존 YES/NO 프로그램처럼 GitHub Desktop에서 **커밋 → Push origin**만 하면 Cloudflare가 자동으로 배포하도록 설정할 수 있습니다. 처음 연결하는 자세한 순서는 [GitHub 자동 배포 설명서](GitHub_자동배포_설명서.md)를 따라 해 주세요.

이 프로그램은 **Cloudflare Worker 한 개**가 화면과 응답 저장을 모두 담당합니다. 별도의 GitHub Pages 설정, API 주소 입력, 비밀 키는 필요하지 않습니다.

## 3. 터미널에서 직접 배포하고 싶을 때

GitHub 연결 전에 직접 배포하거나 자동 배포 문제를 확인할 때만 사용할 수 있습니다.

```powershell
cd C:\Users\yp21h\Desktop\asd\survey
npx wrangler login
npm run deploy
```

`wrangler login`은 브라우저에서 Cloudflare 로그인을 마치면 됩니다. 이미 로그인했다면 다시 실행하지 않아도 됩니다. 배포가 끝나면 터미널에 `https://simple-survey-whgktjs.내계정.workers.dev` 형태의 주소가 표시됩니다. **표시된 주소를 복사해** 아이폰, 아이패드, 노트북에서 열거나 다른 사람에게 보내세요. 실제 주소는 Cloudflare 계정의 서브도메인에 따라 달라집니다.

`npm run deploy`를 실행했는데 `Worker name already taken` 같은 이름 충돌 오류가 나오면 [wrangler.jsonc](wrangler.jsonc)의 `name`을 다른 이름으로 바꾼 뒤 다시 실행하세요.

## 4. 질문을 바꾸고 다시 배포하기

1. [survey.config.js](survey.config.js)의 `question`, `description`, `options`를 수정합니다.
2. 새 설문으로 시작할 때는 `id`도 바꿉니다. 예: `meeting-attendance-v2`.
3. GitHub Desktop에서 변경 파일을 커밋하고 **Push origin**을 누릅니다. Cloudflare Builds가 연결되어 있으면 자동 배포됩니다. 직접 배포 방식이라면 같은 폴더에서 `npm run deploy`를 실행합니다.

배포 주소는 Worker 이름을 바꾸지 않는 한 그대로 유지됩니다. 같은 `id`를 유지한 채 화면 디자인만 수정하면 기존 응답도 유지됩니다.

## 알아둘 점

- 응답은 Cloudflare Durable Object에 저장됩니다. 설문을 보는 브라우저의 익명 식별자로 한 번의 응답을 기록하고, 같은 브라우저에서 다시 고르면 기존 응답을 바꿉니다.
- 로그인 없이 참여하므로 한 사람이 다른 브라우저나 시크릿 모드로 여러 번 응답하는 것을 완벽히 막을 수는 없습니다.
- 결과 화면은 응답 후 나타나며 15초마다 새 결과를 확인합니다. 다른 사람의 응답이 즉시 보이지 않으면 잠시 기다리거나 새로고침하세요.
- 최초 배포에는 Cloudflare 계정의 Workers 사용 권한과 이메일 인증이 필요할 수 있습니다.
