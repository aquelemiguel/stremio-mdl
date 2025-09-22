import { CATALOG_PAGE_SIZE } from "@/lib/settings";
import * as cheerio from "cheerio";
import { AnyNode } from "domhandler";
import type { ContentType, MetaPreview } from "stremio-addon-sdk";
import { searchCinemeta } from "../../cinemeta";

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

const typeMap: Record<string, ContentType> = {
  drama: "series",
  movie: "movie",
  "tv show": "series",
  special: "series",
};

async function getPage(id: string, page: number): Promise<cheerio.CheerioAPI> {
  const url = `https://mydramalist.com/list/${id}?page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return cheerio.load(await res.text());
}

async function getSingleCatalogItem(
  $: cheerio.Cheerio<AnyNode>
): Promise<MetaPreview> {
  const name = $.find(".title > a").text();
  const description = $.find(".content .title + *").text();
  const url = $.find(".title > a").attr("href") || "";

  const match = description.match(/(\w+)\s(\w+) - (\d+)/);
  if (!match) {
    throw new Error("Could not determine media type");
  }

  const [, , mdlType, year] = match;
  const type = typeMap[mdlType.toLowerCase()] || "series";

  const poster = ($.find("a.film-cover > img").attr("data-src") || "").replace(
    "t.jpg",
    "f.jpg"
  ); // up the quality

  const id = await searchCinemeta(name, type, parseInt(year), url);
  return { id, type, name, poster };
}

export async function getCatalogPage(
  id: string,
  skip: number
): Promise<MetaPreview[]> {
  const items: MetaPreview[] = [];

  // each mdl page has 100 items
  // we can pre-calculate the starting page
  let page = Math.floor(skip / 100) + 1;
  let offset = skip % 100;

  while (items.length < CATALOG_PAGE_SIZE) {
    const $ = await getPage(id, page);
    const allEntries = $("li[id^='mdl']").toArray();

    const entries = allEntries.slice(
      offset,
      Math.min(offset + (CATALOG_PAGE_SIZE - items.length), allEntries.length)
    );

    const promises = entries.map(
      async (el): Promise<MetaPreview> => await getSingleCatalogItem($(el))
    );

    const pageItems = await Promise.all(promises);
    items.push(...pageItems);

    if ($("ul.pagination > li.next").length === 0) {
      return items;
    }

    page++;
    offset = 0;
  }

  return items;
}

export async function getSimpleListMeta(
  id: string
): Promise<MdlSimpleCustomListMeta> {
  const res = await fetch(`https://mydramalist.com/list/${id}`);
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
