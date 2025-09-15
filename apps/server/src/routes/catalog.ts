import { getListEntries } from "../parsers/mdl.js";

export const catalogHandler = async (args: any) => {
  const mdllist = args.config?.mdllist || "";
  const results = await getListEntries(mdllist);
  return results;
};
