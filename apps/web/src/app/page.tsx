"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mdlList, setMdlList] = useState("");

  const [isValidating, setIsValidating] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCanInstall(false);

    if (!mdlList) {
      return setIsValidating(false);
    }

    setIsValidating(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/validate?mdl=${mdlList}`);

        const { valid, error } = await res.json();
        setCanInstall(valid);
        setError(error);
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
      open(`stremio://localhost:8080/${mdlList}/manifest.json`);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(/mydramalist\.com\/list\/([a-zA-Z0-9]+)/);

    setMdlList(match ? match[1] : "");
  };

  return (
    <div className="font-sans items-center justify-items-center min-h-screen sm:p-20">
      <main>
        <h1 className="text-3xl font-bold">MyDramaList</h1>
        <h2 className="mt-4 font-semibold">MDL list to bind to catalog</h2>
        <Input
          className="my-1"
          placeholder="https://mydramalist.com/list/3EEVm9b3"
          onChange={onChange}
        />
        {isValidating && (
          <div className="flex flex-row items-center gap-2">
            <Spinner size={16} />
            <span className="text-sm">Validating {mdlList}...</span>
          </div>
        )}
        {!isValidating && canInstall && (
          <div className="flex flex-row items-center gap-2">
            <CircleCheck size={16} color="green" />
            <span className="text-sm text-green-700 font-semibold">Good!</span>
          </div>
        )}
        {!isValidating && error && (
          <div className="flex flex-row items-center gap-2">
            <CircleX size={16} color="red" />
            <span className="text-sm text-red-700 font-semibold">{error}</span>
          </div>
        )}
        <Button className="mt-6" onClick={onInstall} disabled={!canInstall}>
          Install
        </Button>
      </main>
    </div>
  );
}
