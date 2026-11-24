export async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  return (await fetchOk(url, errorMessage)).json() as Promise<T>;
}

export async function fetchText(url: string, errorMessage: string): Promise<string> {
  return (await fetchOk(url, errorMessage)).text();
}

async function fetchOk(url: string, errorMessage: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(errorMessage);
  return response;
}
