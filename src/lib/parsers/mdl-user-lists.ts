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
  year?: number;
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

export async function getListDetails(
  id: string,
  subcategory: string
): Promise<{ owner: string; title: string; totalItems: number }> {
  const res = await fetch(
    `https://mydramalist.com/dramalist/${id}/${subcategory}`
  );
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

// todo: this does not belong here
export async function getUserHandle(id: string): Promise<string> {
  const res = await fetch(`https://mydramalist.com/profile/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  return $(".profile-header h1").text();
}

// todo: move this to a stremio folder probably
export async function buildCatalog(
  list: UserListTableRow[]
): Promise<MetaPreview[]> {
  const promises = list.map(async (row): Promise<MetaPreview> => {
    // todo: probably use content_type here
    const type = row.type === "Movie" ? "movie" : ("series" as ContentType);

    // todo: allow number in cinemeta search
    console.log(row);
    const id = await searchCinemeta(row.title, type, row.year?.toString());

    return {
      id,
      type,
      name: row.title,
      poster: row.poster,
    };
  });

  return await Promise.all(promises);
}

export async function getUserListMeta(id: string, subcategory: string) {
  const res = await fetch(
    `https://mydramalist.com/dramalist/${id}/${subcategory}`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());

  const promises = $("tbody tr")
    .map((_, el) => {
      const $ = cheerio.load(el);
      const id = ($(el).attr("id") || "").replace("ml", "");

      return (async () => {
        const res = await fetch(`https://mydramalist.com/v1/titles/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
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
