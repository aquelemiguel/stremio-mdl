import * as cheerio from "cheerio";
import { MdlTitleResponse } from "../mdl-api/types";
import { MetaPreview, ContentType } from "stremio-addon-sdk";
import { searchCinemeta } from "../cinemeta";

type UserListTableRow = {
  id: number;
  position: number;
  title: string;
  href: string;
  country: string;
  year: number;
  type: string;
  score: number;
  progress: number; // % between watched and total eps
  poster: string;
};

function getProgress(seen: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (seen / total) * 100;
}

// todo: move this to a stremio folder probably
export async function buildCatalog(
  list: UserListTableRow[],
  sort?: null // todo: eventually add sort and filters
): Promise<MetaPreview[]> {
  const promises = list.map(async (row): Promise<MetaPreview> => {
    // todo: probably use content_type here
    const type = row.type === "Movie" ? "movie" : ("series" as ContentType);

    // todo: allow number in cinemeta search
    const id = await searchCinemeta(row.title, type, row.year.toString());

    return {
      id,
      type,
      name: row.title,
      poster: row.poster,
    };
  });

  return await Promise.all(promises);
}

export async function getUserListMeta(doc: string) {
  const $ = cheerio.load(doc);

  const promises = $("tbody tr")
    .map((_, el) => {
      const $ = cheerio.load(el);
      const id = ($(el).attr("id") || "").replace("ml", "");

      return (async () => {
        const res = await fetch(`https://mydramalist.com/v1/titles/${id}`);
        if (!res.ok) {
          // todo: handle here
        }

        const data: MdlTitleResponse = await res.json();

        return {
          id: data.id,
          position: parseInt($("th").text().trim() || "") || 0,
          title: data.title,
          href: data.url,
          country: data.country,
          year: data.year,
          type: data.type,
          score: parseFloat($("td.sort5 .score").text().trim() || "0") || 0,
          progress: getProgress(
            parseFloat($("td.sort6 .episode-seen").text().trim() || "0"),
            parseFloat($("td.sort6 .episode-total").text().trim() || "0")
          ),
          poster: data.cover,
        };
      })();
    })
    .toArray();

  const rows = await Promise.all(promises);
  return await buildCatalog(rows);
}
