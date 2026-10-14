const result = document.querySelector('#result');
document.querySelector('#ok').addEventListener('click', async () => { const response = await fetch('/api/items'); result.textContent = `${response.status} ${await response.text()}`; });
document.querySelector('#missing').addEventListener('click', async () => { const response = await fetch('/api/missing'); result.textContent = `${response.status} ${await response.text()}`; });
document.querySelector('#cors').addEventListener('click', async () => { try { await fetch('http://localhost:4173/api/items'); result.textContent = 'cross-origin permitido'; } catch (error) { result.textContent = `CORS: ${error.message}`; } });
