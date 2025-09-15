"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Check, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mdlList, setMdlList] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [error, setError] = useState("");

  const [meta, setMeta] = useState<{
    title: string;
    total: number;
  } | null>(null);

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
      } catch (err) {
        setCanInstall(false);
      } finally {
        setIsValidating(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [mdlList]);

  const onInstall = () => {
    if (mdlList) {
      window.location.href = `stremio://localhost:8080/${mdlList}/manifest.json`;
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(/mydramalist\.com\/list\/([a-zA-Z0-9]+)/);
    setMdlList(match ? match[1] : "");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
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
          <p className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
            <Check size={12} color="green" />
            {meta.title} ({meta.total} shows)
          </p>
        )}

        {error && (
          <p className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
            <XIcon size={12} color="red" />
            {error}
          </p>
        )}

        <Button
          className="mt-6 w-full"
          onClick={onInstall}
          disabled={!canInstall}
        >
          <div className="flex items-center justify-center gap-2">
            {isValidating && <Spinner />}
            Install addon
          </div>
        </Button>
      </div>
    </div>
  );
}
