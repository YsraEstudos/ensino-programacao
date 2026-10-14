export async function criarDashboard(fetcher) {
  try {
    const responses = await Promise.all([fetcher('/profile'), fetcher('/stats')]);
    for (const response of responses) if (!response?.ok) { const error = new Error(`HTTP ${response?.status}`); error.status = response?.status; throw error; }
    const [profile, stats] = await Promise.all(responses.map(response => response.json()));
    return { status: 'success', profile, stats };
  } catch (error) { return { status: 'error', error }; }
}
