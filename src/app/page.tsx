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
  ConfigUserData,
  getManifestUrl,
  getStremioDeepLink,
  getWebInstallLink,
  MdlListSubtypeMeta,
  MdlListSubtype,
  MdlListType,
} from "@/lib/config";
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

function buildUserData(
  id: string,
  type: MdlListType | null,
  subtype: MdlListSubtype | null
): ConfigUserData | null {
  if (!id || type === null) {
    return null;
  }
  if (type === MdlListType.User) {
    if (subtype === null) {
      return null;
    }
    return { id, type, subtype };
  } else if (type === MdlListType.Custom) {
    return { id, type };
  }

  return null;
}

export default function Home() {
  const [isValidating, setIsValidating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();

  const [type, setType] = useState<MdlListType | null>(null);
  const [subtype, setSubtype] = useState<MdlListSubtype | null>(null);
  const [id, setId] = useState<string>("");

  const withUserData = (action: (userData: ConfigUserData) => void) => {
    return () => {
      const userData = buildUserData(id, type, subtype);
      if (!userData) {
        return;
      }
      action(userData);
    };
  };

  useEffect(() => {
    setCanInstall(false);
    setError(""); // immediately cleanup error, new validation
    setInfo("");

    if (
      !id ||
      type === null ||
      (type === MdlListType.User && subtype === null)
    ) {
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    const timeout = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          id,
          t: type.toString(),
          ...(subtype ? { st: subtype.toString() } : {}),
        });
        const res = await fetch(`/api/validate?${query.toString()}`);
        const { valid, error, info } = await res.json();

        setCanInstall(valid);
        setError(error);
        setInfo(info);
      } catch {
        setCanInstall(false);
      } finally {
        setIsValidating(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [id, type, subtype]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(
      /mydramalist\.com\/(list|dramalist|profile)\/(\w+)/
    );

    if (!match) {
      setType(null);
      setSubtype(null);
      setId("");
      setError("");
      setInfo("");
      return;
    }

    setId(match[2]);
    setType(match[1] === "list" ? MdlListType.Custom : MdlListType.User);
    setSubtype(null);
  };

  const onInstall = () => {
    withUserData((userData) => {
      window.location.href = getStremioDeepLink(userData);
    })();
  };

  const onWebInstall = async () => {
    withUserData((userData) => {
      open(getWebInstallLink(userData));
    })();
  };

  const onClipboard = async () => {
    withUserData(async (userData) => {
      await navigator.clipboard.writeText(getManifestUrl(userData));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 5000);
    })();
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
          {type === MdlListType.User && (
            <div className="animate-in fade-in-0 zoom-in-95 duration-300">
              <Select
                value={subtype?.toString() ?? ""}
                onValueChange={(value) =>
                  setSubtype(value ? (parseInt(value) as MdlListSubtype) : null)
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MdlListSubtypeMeta).map(
                    ([k, { label, slug }]) => (
                      <SelectItem key={slug} value={k}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {info && (
          <p className="mb-6 flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
            <Check size={12} color="green" />
            {info}
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
