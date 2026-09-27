const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('storix_token');

  const headers = {
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Don't send an old JWT to public authentication endpoints.
  const isPublicAuthEndpoint =
    endpoint === '/auth/login' ||
    endpoint === '/auth/register';

  if (token && !isPublicAuthEndpoint) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}