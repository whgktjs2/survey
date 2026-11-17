const title = document.querySelector('#page-title');
const description = document.querySelector('#survey-description');
const responseCount = document.querySelector('#response-count');
const form = document.querySelector('#vote-form');
const optionsBox = document.querySelector('#options');
const submitButton = document.querySelector('#submit-button');
const resultsBox = document.querySelector('#results');
const resultList = document.querySelector('#result-list');
const resultTotal = document.querySelector('#result-total');
const editButton = document.querySelector('#edit-button');
const shareButton = document.querySelector('#share-button');
const message = document.querySelector('#message');

function participantId() {
  let id;
  try { id = localStorage.getItem('simple-survey:participant'); } catch { /* Private browsing may block storage. */ }
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem('simple-survey:participant', id); } catch { /* This visit can still submit. */ }
  }
  return id;
}

const participant = participantId();
let data;
let showingResults = false;

async function api(path, options) {
  const response = await fetch(path, { cache: 'no-store', ...options });
  let body;
  try { body = await response.json(); } catch { throw new Error('서버 응답을 읽을 수 없습니다.'); }
  if (!response.ok) throw new Error(body.error || '잠시 후 다시 시도해 주세요.');
  return body;
}

function showError(error) {
  message.textContent = error instanceof Error ? error.message : '연결을 확인하고 다시 시도해 주세요.';
}

function renderOptions() {
  optionsBox.replaceChildren();
  for (const option of data.options) {
    const label = document.createElement('label');
    label.className = 'option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'choice';
    input.value = option.id;
    input.checked = option.id === data.myChoice;
    const name = document.createElement('span');
    name.textContent = option.label;
    label.append(input, name);
    optionsBox.append(label);
  }
  submitButton.disabled = !optionsBox.querySelector('input:checked');
  submitButton.querySelector('span').textContent = data.myChoice ? '응답 바꾸기' : '응답 제출하기';
}

function renderResults() {
  resultList.replaceChildren();
  resultTotal.textContent = `${data.total}명 참여`;
  for (const option of data.options) {
    const percent = data.total ? Math.round(option.count / data.total * 100) : 0;
    const row = document.createElement('div');
    row.className = `result-row${option.id === data.myChoice ? ' mine' : ''}`;
    const label = document.createElement('div');
    label.className = 'result-label';
    const name = document.createElement('span');
    name.textContent = option.label;
    if (option.id === data.myChoice) {
      const mine = document.createElement('small');
      mine.textContent = '내 응답';
      name.append(mine);
    }
    const number = document.createElement('strong');
    number.textContent = `${percent}%`;
    label.append(name, number);
    const track = document.createElement('div');
    track.className = 'track';
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${option.label}: ${option.count}명, ${percent}%`);
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = `${percent}%`;
    track.append(fill);
    const count = document.createElement('div');
    count.className = 'result-count';
    count.textContent = `${option.count}명`;
    row.append(label, track, count);
    resultList.append(row);
  }
  editButton.textContent = data.myChoice ? '내 응답 바꾸기 →' : '응답하기 →';
}

function render() {
  title.textContent = data.question;
  description.textContent = data.description;
  responseCount.textContent = `${data.total}명 참여`;
  form.hidden = showingResults;
  resultsBox.hidden = !showingResults;
  renderOptions();
  renderResults();
}

optionsBox.addEventListener('change', () => { submitButton.disabled = false; message.textContent = ''; });
form.addEventListener('submit', async event => {
  event.preventDefault();
  const choice = optionsBox.querySelector('input:checked')?.value;
  if (!choice) return;
  submitButton.disabled = true;
  message.textContent = '';
  try {
    data = await api('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant, choice }),
    });
    showingResults = true;
    render();
  } catch (error) {
    showError(error);
    submitButton.disabled = false;
  }
});

editButton.addEventListener('click', () => {
  showingResults = false;
  message.textContent = '';
  render();
  optionsBox.querySelector('input:checked')?.focus();
});

shareButton.addEventListener('click', async () => {
  const url = new URL('/', location.href).href;
  try {
    await navigator.clipboard.writeText(url);
    shareButton.lastChild.textContent = ' 링크를 복사했어요';
    setTimeout(() => { shareButton.lastChild.textContent = ' 설문 링크 복사'; }, 2500);
  } catch {
    window.prompt('아래 설문 링크를 복사해 주세요.', url);
  }
});

async function refresh() {
  try {
    const next = await api(`/api/survey?participant=${encodeURIComponent(participant)}`);
    data = next;
    if (showingResults) render();
    else if (!form.hidden || !resultsBox.hidden) responseCount.textContent = `${data.total}명 참여`;
    message.textContent = '';
  } catch (error) { if (!data) showError(error); }
}

async function start() {
  try {
    data = await api(`/api/survey?participant=${encodeURIComponent(participant)}`);
    showingResults = Boolean(data.myChoice);
    render();
  } catch (error) {
    title.textContent = '설문을 불러오지 못했어요.';
    description.textContent = '인터넷 연결을 확인한 뒤 새로고침해 주세요.';
    showError(error);
  }
}

start();
setInterval(() => { if (data && !document.hidden) refresh(); }, 15000);
