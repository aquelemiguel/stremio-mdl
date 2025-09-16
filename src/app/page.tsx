"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { type MdlListMeta } from "@/lib/parsers/mdl";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Check, Clipboard, Coffee, Github, Globe, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mdlList, setMdlList] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [meta, setMeta] = useState<MdlListMeta | null>(null);

  useEffect(() => {
    setCanInstall(false);

    if (!mdlList) {
      setMeta(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setMeta(null);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/validate?mdl=${mdlList}`);
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
  }, [mdlList]);

  const onInstall = () => {
    if (mdlList) {
      window.location.href = `stremio://localhost:3000/api/${mdlList}/manifest.json`;
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(/mydramalist\.com\/list\/([a-zA-Z0-9]+)/);
    setMdlList(match ? match[1] : "");
  };

  const onWebInstall = async () => {
    const addonUrl = `stremio://localhost:3000/api/${mdlList}/manifest.json`;
    open(
      `http://web.stremio.com/#/addons?addon=${encodeURIComponent(addonUrl)}`
    );
  };

  const onClipboard = async () => {
    await navigator.clipboard.writeText(
      `stremio://localhost:3000/api/${mdlList}/manifest.json`
    );
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 sm:pb-6">
        <h1 className="text-3xl font-bold text-center">stremio-mdl</h1>
        <p className="mt-1 text-center text-gray-600 font-medium">
          MyDramaList lists as Stremio catalogs
        </p>

        <Input
          className="mt-6"
          placeholder="https://mydramalist.com/list/3EEVm9b3"
          onChange={onChange}
        />

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

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-8">
            <a
              href="https://github.com/aquelemiguel/stremio-mdl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="View source on GitHub"
            >
              <Github size={16} />
              <span className="text-xs">aquelemiguel</span>
            </a>
            <a
              href="https://buymeacoffee.com/aquelemiguel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Support development"
            >
              <Coffee size={16} />
              <span className="text-xs">Buy me a coffee</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
