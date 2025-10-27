export async function callBackend(
  path: string,
  init?: RequestInit & { json?: unknown }
) {
  const url = path.startsWith("http") ? path : `/api/backend${path}`;
  const headers = new Headers(init?.headers);

  // Default JSON
  if (!headers.has("Content-Type") && (init?.body || init?.json)) {
    headers.set("Content-Type", "application/json");
  }

  // Jika caller kirim { json: obj }, kita stringify di sini
  let body = init?.body;
  if (!body && init?.json !== undefined) {
    body = JSON.stringify(init.json);
  }

  return fetch(url, { ...init, headers, body, cache: "no-store" });
}
