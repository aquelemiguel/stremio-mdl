import { getListEntries } from "../parsers/mdl.js";

export const catalogHandler = async (args: any) => {
  return await getListEntries();
};
