import * as cheerio from "cheerio";
import type { MetaPreview } from "stremio-addon-sdk";

export async function getListEntries() {
  const res = await fetch("https://mydramalist.com/list/3EEVm9b3");
  if (!res.ok) {
    throw new Error(`failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const els = $("li[id^='mdl']").toArray();

  const promises = els.map(async (el) => {
    const name = $(el).find(".title > a").text();

    let poster = $(el).find("a.film-cover > img").attr("data-src") || "";
    poster = poster.replace("_4t", "_4c"); // up the quality

    // cinemeta search
    const res = await fetch(
      "https://v3-cinemeta.strem.io/catalog/series/top/search=" +
        encodeURIComponent(name) +
        ".json"
    );

    const data = await res.json();
    const id = data.metas?.[0]?.imdb_id || "";

    return {
      id,
      type: "series" as const, // todo: handle this later on...
      name,
      poster,
    } satisfies MetaPreview;
  });

  const metas = await Promise.all(promises);
  return Promise.resolve({ metas });
}
