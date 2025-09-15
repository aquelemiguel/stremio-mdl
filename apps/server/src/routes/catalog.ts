import { getListEntries } from "../parsers/mdl.js";

export const catalogHandler = async (args: any) => {
  const mdllist = args.config?.mdllist || "";
  return await getListEntries(mdllist);
};
