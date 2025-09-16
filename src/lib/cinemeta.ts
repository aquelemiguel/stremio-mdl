export async function searchCinemeta(query: string): Promise<string> {
  const url = "https://v3-cinemeta.strem.io/catalog/series/top";

  const res = await fetch(`${url}/search=${encodeURIComponent(query)}.json`);
  if (!res.ok) {
    throw new Error(`failed to fetch: ${res.status}`);
  }

  const data = await res.json();
  return data.metas?.[0]?.imdb_id || "";
}
