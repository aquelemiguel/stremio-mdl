import * as cheerio from "cheerio";
import type { ContentType, MetaPreview } from "stremio-addon-sdk";
import { searchCinemeta } from "../cinemeta";

export type MdlSimpleCustomListMeta = {
  type: "shows" | "people";
  title: string;
  totalItems: number;
};

export type MdlCustomListItem = {
  meta: MetaPreview;
  url: string;
};

export type MdlCustomListMeta = MdlSimpleCustomListMeta & {
  items: MdlCustomListItem[];
};

export type MdlContentMeta = {
  originalTitle: string;
};

export async function getListMeta(mdlId: string): Promise<MdlCustomListMeta> {
  const simpleMeta = await getSimpleListMeta(mdlId);
  const items: MdlCustomListItem[] = [];

  for (let page = 1; (page - 1) * 100 <= simpleMeta.totalItems; page++) {
    const url = `https://mydramalist.com/list/${mdlId}?page=${page}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`failed to fetch: ${res.status}`);
    }

    const $ = cheerio.load(await res.text());
    const els = $("li[id^='mdl']").toArray();

    const promises = els.map(async (el): Promise<MdlCustomListItem> => {
      const name = $(el).find(".title > a").text();
      const description = $(el).find(".content .title + *").text();
      const url = $(el).find(".title > a").attr("href") || "";

      const match = description.match(/(\w+)\s(\w+) - (\d+)/);
      if (!match) {
        throw new Error("Could not determine media type");
      }

      const typeMap: Record<string, ContentType> = {
        drama: "series",
        movie: "movie",
        "tv show": "series",
        special: "series",
      };

      const [, , mdlType, releaseYear] = match;
      const type = typeMap[mdlType.toLowerCase()] || "series";

      let poster = $(el).find("a.film-cover > img").attr("data-src") || "";
      poster = poster.replace("t.jpg", "f.jpg"); // up the quality

      const id = await searchCinemeta(name, type, releaseYear, url);

      return {
        meta: {
          id,
          type,
          name,
          poster,
        },
        url,
      };
    });

    const pageItems = await Promise.all(promises);
    items.push(...pageItems);
  }

  return {
    ...simpleMeta,
    items,
  };
}

export async function getSimpleListMeta(
  mdlId: string
): Promise<MdlSimpleCustomListMeta> {
  const res = await fetch(`https://mydramalist.com/list/${mdlId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const itemsEl = $(".list-bars").children().first().text().trim();

  const match = itemsEl.match(/(\d+) (titles|people|tv show)/i);
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

export async function getContentMeta(path: string): Promise<MdlContentMeta> {
  const res = await fetch(`https://mydramalist.com${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const originalTitle = $(".film-subtitle > span").text().split("‧")[0] || "";

  return {
    originalTitle,
  };
}
