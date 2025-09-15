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
      window.location.href = `stremio://localhost:8080/${mdlList}/manifest.json`;
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const match = url.match(/mydramalist\.com\/list\/([a-zA-Z0-9]+)/);
    setMdlList(match ? match[1] : "");
  };

  const status = isValidating
    ? {
        icon: <Spinner size={16} />,
        text: `Validating ${mdlList}...`,
        color: "text-gray-700",
      }
    : canInstall
    ? {
        icon: <CircleCheck size={16} color="green" />,
        text: "Good!",
        color: "text-green-700",
      }
    : error
    ? {
        icon: <CircleX size={16} color="red" />,
        text: error,
        color: "text-red-700",
      }
    : null;

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

        {status && (
          <div className="flex items-center gap-2 mt-3">
            {status.icon}
            <span className={`text-sm font-semibold ${status.color}`}>
              {status.text}
            </span>
          </div>
        )}

        <Button
          className="mt-6 w-full"
          onClick={onInstall}
          disabled={!canInstall}
        >
          Install
        </Button>
      </div>
    </div>
  );
}
