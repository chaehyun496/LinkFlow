const form = document.querySelector('#url-form');
const list = document.querySelector('#url-list');
const result = document.querySelector('#result');
const message = document.querySelector('#message');

const EMPTY_URL_MESSAGE = 'URL을 입력해주세요.';
const URL_PREFIX_MESSAGE = 'http:// 또는 https://로 시작하는 URL을 입력해주세요.';

async function loadUrls() {
  const response = await fetch('/api/urls');
  const urls = await response.json();
  list.innerHTML = urls.length ? urls.map(item => `<tr><td><a href="/${item.code}">${location.origin}/${item.code}</a></td><td title="${item.original_url}">${item.original_url}</td><td><strong>${item.clicks}</strong></td><td>${new Date(item.created_at + 'Z').toLocaleString('ko-KR')}</td></tr>`).join('') : '<tr><td colspan="4">아직 생성된 URL이 없습니다.</td></tr>';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  result.classList.add('hidden');

  const url = form.url.value.trim();
  if (!url) {
    message.textContent = EMPTY_URL_MESSAGE;
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    message.textContent = URL_PREFIX_MESSAGE;
    return;
  }

  const response = await fetch('/api/urls', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({url})
  });
  const data = await response.json();
  if (!response.ok) {
    message.textContent = data.detail || 'URL 생성에 실패했습니다.';
    return;
  }
  result.innerHTML = `생성 완료: <a href="/${data.code}">${data.short_url}</a>`;
  result.classList.remove('hidden');
  form.reset();
  loadUrls();
});

document.querySelector('#refresh').addEventListener('click', loadUrls);
loadUrls();
