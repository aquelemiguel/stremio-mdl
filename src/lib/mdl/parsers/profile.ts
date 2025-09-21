import * as cheerio from "cheerio";

export async function getUserHandle(id: string): Promise<string> {
  const res = await fetch(`https://mydramalist.com/profile/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const $ = cheerio.load(await res.text());
  return $(".profile-header h1").text();
}
