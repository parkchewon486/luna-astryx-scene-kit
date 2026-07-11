const originalFetch = window.fetch.bind(window);

window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const rawUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  const isTrendRequest = rawUrl === '/api/trends' || rawUrl.endsWith('/api/trends');

  if (isTrendRequest) {
    return originalFetch(`/api/hot-issues?build=20260711-3&ts=${Date.now()}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  }

  return originalFetch(input, init);
}) as typeof window.fetch;
