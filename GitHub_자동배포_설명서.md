# 설문조사 GitHub 자동 배포 설명서

설정이 끝나면 이 순서만 반복하면 됩니다.

**설문 파일 수정 → GitHub Desktop에서 Commit to main → Push origin → Cloudflare 자동 배포**

설문은 화면과 API가 한 Cloudflare Worker에 들어 있습니다. 기존 YES/NO 앱처럼 GitHub Pages와 API를 따로 배포할 필요가 없습니다.

## 1. GitHub Desktop에 설문 폴더 추가

1. GitHub Desktop을 엽니다.
2. 위쪽 메뉴 **File → Add local repository...**를 누릅니다.
3. **Choose...**를 눌러 `C:\Users\yp21h\Desktop\asd\survey` 폴더를 선택합니다.
4. **Add repository**를 누릅니다. 왼쪽 위 **Current repository**가 `survey`인지 확인하세요. 기존 `yes-no` 저장소를 선택한 상태로 진행하지 마세요.
5. 왼쪽 아래 **Summary**에 `설문조사 첫 버전`을 적고 **Commit to main**을 누릅니다.
6. 위쪽의 **Publish repository**를 누릅니다. 저장소 이름은 예를 들어 `simple-survey`로 설정하세요. 비공개로 두려면 **Keep this code private**를 체크한 채 게시합니다.
7. GitHub 웹사이트에서 새 저장소에 `wrangler.jsonc`, `package.json`, `survey.config.js`, `public`, `src`가 올라왔는지 확인합니다. `node_modules`와 `.wrangler`는 올라가지 않아야 합니다.

GitHub Desktop의 **Publish repository**는 코드를 GitHub에 올리는 단계입니다. 다음 단계에서 Cloudflare에 이 저장소를 연결하면 실제 설문 URL이 만들어집니다.

## 2. Cloudflare에 GitHub 저장소 연결

1. [Cloudflare 대시보드](https://dash.cloudflare.com/)에 로그인합니다.
2. 왼쪽 **Workers & Pages**로 이동하여 **Create application**을 누릅니다.
3. **GitHub**를 선택하고, 방금 만든 `simple-survey` 저장소를 선택합니다. GitHub 접근 권한을 묻는 창이 나오면 이 저장소에 대한 접근을 허용합니다.
4. Worker 이름을 **`simple-survey-whgktjs`**로 설정합니다. 저장소의 `wrangler.jsonc` 안에 있는 `name`과 같아야 합니다. 같은 이름을 이미 다른 Worker가 사용 중이라면 `wrangler.jsonc`의 이름을 새 이름으로 바꾸고 GitHub에 먼저 푸시한 뒤, 그 새 이름을 여기에도 입력하세요.
5. 배포 설정을 아래와 같이 입력합니다.

   - **Production branch:** `main`
   - **Root directory / Path:** 저장소의 맨 위 폴더. 입력란이 비어 있으면 그대로 둡니다. `public`이나 `src`를 입력하지 않습니다.
   - **Build command:** `npm run check`
   - **Deploy command:** `npm run deploy`
   - **Enable Preview builds:** 필요하지 않다면 끕니다.
   - **API token:** Cloudflare가 자동으로 만드는 기본 토큰을 사용합니다. 별도의 키를 코드나 GitHub 저장소에 입력하지 않습니다.

6. **Save and Deploy** 또는 **Connect**를 눌러 연결합니다. 화면 이름은 Cloudflare 업데이트에 따라 조금 다를 수 있습니다.
7. **Deployments / Builds**에서 배포 상태가 **Success**인지 확인합니다. 첫 연결 직후 자동 빌드가 시작되지 않으면, GitHub Desktop에서 작은 변경을 커밋하고 **Push origin**을 누르세요.
8. Cloudflare가 보여 주는 `https://simple-survey-whgktjs.계정서브도메인.workers.dev` 형태의 **실제 주소**를 열어 봅니다. 이 주소가 다른 사람에게 보낼 설문 링크입니다.

## 3. 이후 설문을 수정할 때

1. `survey.config.js`에서 문구를 바꿉니다. 질문이나 선택지를 바꿔 새 설문으로 시작한다면 `id`도 바꿉니다.
2. GitHub Desktop에서 **Current repository: survey**를 확인합니다.
3. 변경 파일을 확인하고 **Summary**를 적은 뒤 **Commit to main → Push origin**을 누릅니다.
4. Cloudflare **Workers & Pages → simple-survey-whgktjs → Deployments**에서 성공 여부를 확인합니다. 새로고침하면 최신 화면이 보입니다.

## 배포가 안 될 때 확인할 곳

- GitHub Desktop에 **Push origin**이 남아 있으면 아직 GitHub에 올라가지 않은 상태입니다.
- Cloudflare **Deployments / Builds**에서 실패한 항목을 열면 오류 메시지를 볼 수 있습니다.
- `Missing entry-point` 오류는 **Root directory**가 `public`이나 `src`로 잘못 설정되었을 때 생길 수 있습니다. 저장소 루트를 선택하세요.
- Worker 이름 오류가 나오면 Cloudflare Worker 이름과 `wrangler.jsonc`의 `name`이 같은지 확인하세요.
- 내 컴퓨터에서 먼저 설정을 검사하려면 PowerShell에서 `cd C:\Users\yp21h\Desktop\asd\survey` 후 `npm run check`를 실행하세요. 이 명령은 실제 배포를 하지 않습니다.

참고: [Cloudflare Workers Builds 공식 안내](https://developers.cloudflare.com/workers/ci-cd/builds/), [빌드 설정 공식 안내](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
