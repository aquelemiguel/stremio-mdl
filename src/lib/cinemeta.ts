import { ContentType } from "stremio-addon-sdk";
import { getContentMeta } from "./mdl/parsers/list";

type CinemetaResponse = {
  metas: {
    imdb_id: string;
    releaseInfo?: string;
    year?: string;
  }[];
};

function findByReleaseYear(
  metas: CinemetaResponse["metas"],
  releaseYear?: number
): string | undefined {
  if (releaseYear === undefined) {
    return undefined;
  }
  return metas.find(
    (meta) =>
      meta.releaseInfo?.startsWith(`${releaseYear}`) ||
      meta.year === `${releaseYear}`
  )?.imdb_id;
}

export async function searchCinemeta(
  query: string,
  type: ContentType,
  releaseYear?: number,
  itemUrl?: string
): Promise<string> {
  const url = `https://v3-cinemeta.strem.io/catalog/${type}/top`;
  const sanitized = query.replace(/[^\w\s]|_/g, "");

  const res = await fetch(
    `${url}/search=${encodeURIComponent(sanitized)}.json`
  );
  if (!res.ok) {
    console.log(`Cinemeta timed out while querying: ${sanitized}`); // todo: retry request
    return "";
  }

  const { metas }: CinemetaResponse = await res.json();
  const fallback = metas[0]?.imdb_id || "";

  const matched = findByReleaseYear(metas, releaseYear);
  if (matched) {
    return matched;
  }

  if (itemUrl) {
    const { originalTitle } = await getContentMeta(itemUrl);

    if (originalTitle) {
      const res = await fetch(
        `${url}/search=${encodeURIComponent(originalTitle)}.json`
      );
      if (!res.ok) {
        return fallback;
      }

      const { metas }: CinemetaResponse = await res.json();
      const matched = findByReleaseYear(metas, releaseYear);
      if (matched) {
        return matched;
      }
    }
  }
  return fallback;
}
