import * as cheerio from "cheerio";
import type { MetaPreview } from "stremio-addon-sdk";
import { searchCinemeta } from "../cinemeta";

export type MdlSimpleListMeta = {
  type: "shows" | "people";
  title: string;
  totalItems: number;
};

export type MdlListMeta = MdlSimpleListMeta & {
  items: MetaPreview[];
};

export async function getListMeta(mdlId: string): Promise<MdlListMeta> {
  const simpleMeta = await getSimpleListMeta(mdlId);
  const metas: MetaPreview[] = [];

  for (let page = 1; (page - 1) * 100 <= simpleMeta.totalItems; page++) {
    const url = `https://mydramalist.com/list/${mdlId}?page=${page}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`failed to fetch: ${res.status}`);
    }

    const $ = cheerio.load(await res.text());
    const els = $("li[id^='mdl']").toArray();

    const promises = els.map(async (el) => {
      const name = $(el).find(".title > a").text();

      let poster = $(el).find("a.film-cover > img").attr("data-src") || "";
      poster = poster.replace("t.jpg", "f.jpg"); // up the quality

      const imdbId = await searchCinemeta(name);

      return {
        id: imdbId,
        type: "series" as const, // todo: handle this later on...
        name,
        poster,
      } satisfies MetaPreview;
    });

    const pageMetas = await Promise.all(promises);
    metas.push(...pageMetas);
  }

  return {
    ...simpleMeta,
    items: metas,
  };
}

export async function getSimpleListMeta(
  mdlId: string
): Promise<MdlSimpleListMeta> {
  const res = await fetch(`https://mydramalist.com/list/${mdlId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const itemsEl = $(".list-bars").children().first().text().trim();

  const match = itemsEl.match(/(\d+) (titles|people)/i);
  if (!match) {
    throw new Error("Could not determine list type");
  }

  const [, totalItems, type] = match || [];
  const title = $("header > h1").text();

  return {
    type: type === "People" ? "people" : "shows",
    title,
    totalItems: parseInt(totalItems),
  };
}
