export const TOKEN_KEY = "secure-notes-token";

export async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { ...options.headers };
  if (options.body != null) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers,
    body: options.body == null ? undefined : JSON.stringify(options.body),
  });
  const result = response.status === 204 ? null : await response.json();
  if (response.status === 401 && token) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("auth-expired"));
    window.location.replace("/login");
  }
  if (!response.ok)
    throw new Error(
      result?.error?.message || `Request failed (${response.status})`,
    );
  return result;
}
