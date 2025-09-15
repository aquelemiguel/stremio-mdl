import * as cheerio from "cheerio";
import type { MetaPreview } from "stremio-addon-sdk";

export async function getListEntries(mdllist: string) {
  if (!mdllist) {
    throw new Error("missing mdllist, configure addon");
  }

  let page = 1;
  let metas: MetaPreview[] = [];

  while (true) {
    const url = `https://mydramalist.com/list/${mdllist}?page=${page}`;
    const res = await fetch(url);

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
      // todo: use https://github.com/Ivshti/name-to-imdb
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

    const pageMetas = await Promise.all(promises);
    metas.push(...pageMetas);

    const totalEl = $(".list-bars").children().first().text();
    const match = totalEl.match(/(\d+) Titles/);

    if (!match || parseInt(match[1]) <= page * 100) {
      break;
    }
    page++;
  }

  return Promise.resolve({ metas });
}
