const form = document.querySelector('#url-form');
const list = document.querySelector('#url-list');
const result = document.querySelector('#result');
const message = document.querySelector('#message');

const EMPTY_URL_MESSAGE = 'URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.';
const URL_PREFIX_MESSAGE = 'http:// \uB610\uB294 https://\uB85C \uC2DC\uC791\uD558\uB294 URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.';

async function loadUrls() {
  const response = await fetch('/api/urls');
  const urls = await response.json();
  list.innerHTML = urls.length ? urls.map(item => `<tr><td><a href="/${item.code}">${location.origin}/${item.code}</a></td><td title="${item.original_url}">${item.original_url}</td><td><strong>${item.clicks}</strong></td><td>${new Date(item.created_at + 'Z').toLocaleString('ko-KR')}</td></tr>`).join('') : '<tr><td colspan="4">아직 생성된 URL이 없습니다.</td></tr>';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  result.classList.add('hidden');

  const url = document.querySelector('#url').value.trim();
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
    message.textContent = data.detail || 'URL \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.';
    return;
  }
  result.innerHTML = `\uC0DD\uC131 \uC644\uB8CC: <a href="/${data.code}">${data.short_url}</a>`;
  result.classList.remove('hidden');
  form.reset();
  loadUrls();
});

document.querySelector('#refresh').addEventListener('click', loadUrls);
loadUrls();
