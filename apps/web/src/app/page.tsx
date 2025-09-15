"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const onInstall = () => {
    open("stremio://localhost:8080/3EEVm9b3/manifest.json");
  };

  return (
    <div className="font-sans items-center justify-items-center min-h-screen sm:p-20">
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <h1 className="text-4xl font-semibold">MyDramaList</h1>
        <Input placeholder="https://mydramalist.com/list/3EEVm9b3" />
        <Button onClick={onInstall}>Install</Button>
      </main>
    </div>
  );
}
