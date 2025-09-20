"use client";

import { Footer } from "@/components/Footer";
import { HintSpan } from "@/components/HintSpan";
import { PerforatedLine } from "@/components/PerforatedLine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getManifestUrl,
  getStremioDeepLink,
  getWebInstallLink,
} from "@/lib/config";
import { type MdlCustomListMeta } from "@/lib/parsers/mdl-custom-lists";
import {
  Check,
  Clipboard,
  Globe,
  InfoIcon,
  Popcorn,
  Sofa,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type MdlUserListType = {
  name: string;
  path: string;
};

const mdlUserListTypes: MdlUserListType[] = [
  {
    name: "Watching",
    path: "watching",
  },
  {
    name: "Completed",
    path: "completed",
  },
  {
    name: "On Hold",
    path: "on_hold",
  },
  {
    name: "Dropped",
    path: "dropped",
  },
  {
    name: "Plan to Watch",
    path: "plan_to_watch",
  },
  {
    name: "Undecided",
    path: "undecided",
  },
  {
    name: "Not Interested",
    path: "not_interested",
  },
];

export default function Home() {
  const [isValidating, setIsValidating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [meta, setMeta] = useState<MdlCustomListMeta | null>(null);

  const [category, setCategory] = useState<"user" | "custom">();
  const [subcategory, setSubcategory] = useState<string>();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    setCanInstall(false);

    if (!id || !category || !subcategory) {
      setMeta(null);
      setIsValidating(false);
      setError("");
      return;
    }

    setIsValidating(true);
    setMeta(null);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/validate?category=${category}&subcategory=${subcategory}&id=${id}`
        );
        const { valid, error, meta } = await res.json();
        setCanInstall(valid);
        setError(error);
        setMeta(meta || null);
      } catch {
        setCanInstall(false);
      } finally {
        setIsValidating(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [category, subcategory, id]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(
      /mydramalist\.com\/(list|dramalist|profile)\/(\w+)/
    );

    setCategory(undefined);
    setSubcategory(undefined);

    if (!match) {
      return;
    }

    const [, category, id] = match;

    switch (category) {
      case "list":
        setCategory("custom");
        setSubcategory("custom");
        break;

      case "dramalist":
      case "profile":
        setCategory("user");
        break;
    }

    setId(id);
  };

  const onInstall = () => {
    if (!id || !category || !subcategory) {
      return;
    }
    const installUrl = getStremioDeepLink({ id, category, subcategory });
    window.location.href = installUrl;
  };

  const onWebInstall = async () => {
    if (!id || !category || !subcategory) {
      return;
    }
    const installUrl = getWebInstallLink({ id, category, subcategory });
    open(installUrl);
  };

  const onClipboard = async () => {
    if (!id || !category || !subcategory) {
      return;
    }
    const manifestUrl = getManifestUrl({ id, category, subcategory });
    await navigator.clipboard.writeText(manifestUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 sm:pb-6">
        <h1 className="text-3xl font-bold text-center">stremio-mdl</h1>
        <p className="mt-1 text-center text-gray-500 font-medium">
          MyDramaList lists as Stremio catalogs
        </p>

        <PerforatedLine className="my-4">
          <Popcorn size={18} className="text-gray-300" />
        </PerforatedLine>

        <div className="flex items-center gap-1.5">
          <InfoIcon size={12} className="text-gray-500" />
          <p className="text-xs text-gray-500">
            Enter a{" "}
            <HintSpan
              text="profile"
              hint="https://mydramalist.com/profile/user123"
            />
            ,{" "}
            <HintSpan
              text="drama list"
              hint="https://mydramalist.com/dramalist/user123"
            />{" "}
            or{" "}
            <HintSpan
              text="custom list"
              hint="https://mydramalist.com/list/123abc"
            />{" "}
            link.
          </p>
        </div>

        <div className="mt-2 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Paste your link here..."
            onChange={onChange}
          />
          <Select
            value={subcategory}
            onValueChange={(value) => setSubcategory(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {category === "custom" ? (
                <SelectItem key="custom" value="custom">
                  Custom
                </SelectItem>
              ) : (
                mdlUserListTypes.map(({ name, path }) => (
                  <SelectItem key={path} value={path}>
                    {name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {meta && (
          <p className="mb-6 flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
            <Check size={12} color="green" />
            {meta.title} ({meta.totalItems} shows)
          </p>
        )}

        {error && (
          <p className="mb-6 flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
            <XIcon size={12} color="red" />
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            className="flex-1 cursor-pointer"
            onClick={onInstall}
            disabled={!canInstall}
          >
            <div className="flex items-center justify-center gap-2">
              {isValidating && <Spinner />}
              Install addon
            </div>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                onClick={onWebInstall}
                disabled={!canInstall}
              >
                <Globe />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Install on the web</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                onClick={onClipboard}
                disabled={!canInstall}
              >
                {isCopied ? <Check /> : <Clipboard />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCopied ? "Copied!" : "Copy to clipboard"}
            </TooltipContent>
          </Tooltip>
        </div>

        <PerforatedLine className="mb-2 mt-4">
          <Sofa size={18} className="text-gray-300" />
        </PerforatedLine>

        <Footer />
      </div>
    </div>
  );
}
