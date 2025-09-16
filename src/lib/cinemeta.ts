import { ContentType } from "stremio-addon-sdk";

export async function searchCinemeta(
  query: string,
  type: ContentType,
  releaseYear?: string
): Promise<string> {
  const url = `https://v3-cinemeta.strem.io/catalog/${type}/top`;

  const res = await fetch(`${url}/search=${encodeURIComponent(query)}.json`);
  if (!res.ok) {
    throw new Error(`failed to fetch: ${res.status}`);
  }

  const data = await res.json();

  // todo: get original title name if nothing matches...

  if (releaseYear) {
    for (const meta of data.metas) {
      if (
        (meta.releaseInfo as string | undefined)?.startsWith(releaseYear) ||
        meta.year === releaseYear
      ) {
        return meta.imdb_id;
      }
    }
  }

  return data.metas[0]?.imdb_id || "";
}
