import * as cheerio from "cheerio";
import { MdlTitleResponse } from "../types";
import { ContentType, MetaPreview } from "stremio-addon-sdk";
import { CATALOG_PAGE_SIZE } from "@/lib/settings";
import { searchCinemeta } from "@/lib/cinemeta";
import { MdlListSubtypeMeta, MdlListSubtype } from "@/lib/config";

async function getSingleCatalogItem(id: string): Promise<MetaPreview> {
  const res = await fetch(`https://mydramalist.com/v1/titles/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const data: MdlTitleResponse = await res.json();

  const type = data.type === "Movie" ? "movie" : ("series" as ContentType);
  const imdbId = await searchCinemeta(data.title, type, data.year);

  return {
    id: imdbId,
    type,
    name: data.title,
    poster: data.cover,
  };
}

export async function getCatalogPage(
  id: string,
  subtype: MdlListSubtype,
  skip: number
): Promise<MetaPreview[]> {
  const { slug } = MdlListSubtypeMeta[subtype];

  const res = await fetch(`https://mydramalist.com/dramalist/${id}/${slug}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const allEntries = $("tbody tr").toArray();

  const entries = allEntries.slice(
    skip,
    Math.min(skip + CATALOG_PAGE_SIZE, allEntries.length)
  );

  const promises = entries.map(async (el) => {
    const $ = cheerio.load(el);
    const id = ($(el).attr("id") || "").replace("ml", "");

    return await getSingleCatalogItem(id);
  });

  return await Promise.all(promises);
}

export async function getListDetails(
  id: string,
  subtype: MdlListSubtype
): Promise<{ owner: string; title: string; totalItems: number }> {
  const { slug } = MdlListSubtypeMeta[subtype];

  const res = await fetch(`https://mydramalist.com/dramalist/${id}/${slug}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  const owner = $("h1.mdl-style-header a").text();
  const title = $("li.nav-item.active > a").text();

  if (!$(".mdl-style-list").length) {
    return { owner, title, totalItems: 0 };
  }

  const totalItems = parseInt(
    $(".mdl-style-table tbody tr:last-child > th").text()
  );

  return { owner, title, totalItems };
}
