import { getAccessToken, setAccessToken } from '../auth';

async function tryRefresh() {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken ?? null);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || undefined);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers, credentials: 'include' });
  if (res.status !== 401) return res;

  // intentar refresh y reintentar
  const refreshed = await tryRefresh();
  if (!refreshed) return res;

  const newToken = getAccessToken();
  if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
  return fetch(input, { ...init, headers, credentials: 'include' });
}

export default apiFetch;
