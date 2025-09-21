import { ContentType, MetaPreview } from "stremio-addon-sdk";
import { UserListTableRow } from "./mdl/parsers/dramalist"; // todo: should not import from parsers
import { searchCinemeta } from "./cinemeta";

export async function buildCatalog(
  list: UserListTableRow[]
): Promise<MetaPreview[]> {
  const promises = list.map(async (row): Promise<MetaPreview> => {
    // todo: probably use content_type here
    const type = row.type === "Movie" ? "movie" : ("series" as ContentType);
    const id = await searchCinemeta(row.title, type, row.year);

    return {
      id,
      type,
      name: row.title,
      poster: row.poster,
    };
  });

  return await Promise.all(promises);
}
