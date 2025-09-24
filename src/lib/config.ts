import { encode } from "./utils";

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
}

export enum MdlListType {
  User,
  Custom,
}

export enum MdlListSubtype {
  Watching,
  Completed,
  OnHold,
  Dropped,
  PlanToWatch,
  Undecided,
  NotInterested,
}

export const MdlListSubtypeMeta: Record<
  MdlListSubtype,
  { label: string; slug: string }
> = {
  [MdlListSubtype.Watching]: { label: "Watching", slug: "watching" },
  [MdlListSubtype.Completed]: { label: "Completed", slug: "completed" },
  [MdlListSubtype.OnHold]: { label: "On Hold", slug: "on_hold" },
  [MdlListSubtype.Dropped]: { label: "Dropped", slug: "dropped" },
  [MdlListSubtype.PlanToWatch]: {
    label: "Plan to Watch",
    slug: "plan_to_watch",
  },
  [MdlListSubtype.Undecided]: { label: "Undecided", slug: "undecided" },
  [MdlListSubtype.NotInterested]: {
    label: "Not Interested",
    slug: "not_interested",
  },
};

export type ConfigUserData =
  | {
      id: string;
      type: MdlListType.User;
      subtype: MdlListSubtype;
    }
  | {
      id: string;
      type: MdlListType.Custom;
    };

export function getStremioDeepLink(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl().replace(/https?:\/\//, "");
  const encoded = encode(userData);

  return `stremio://${baseUrl}/api/${encoded}/manifest.json`;
}

export function getWebInstallLink(userData: ConfigUserData): string {
  const baseUrl = "http://web.stremio.com/#/addons";
  const addonUrl = getManifestUrl(userData);

  return `${baseUrl}?addon=${encodeURIComponent(addonUrl)}`;
}

export function getManifestUrl(userData: ConfigUserData): string {
  const baseUrl = getBaseUrl();
  const encoded = encode(userData);

  return `${baseUrl}/api/${encoded}/manifest.json`;
}
