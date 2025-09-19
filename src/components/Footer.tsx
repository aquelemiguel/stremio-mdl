import { getVersion } from "@/lib/manifest";
import { Coffee, Github } from "lucide-react";

export function Footer() {
  const version = getVersion();

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/aquelemiguel/stremio-mdl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="View source on GitHub"
          >
            <Github size={14} />
            <span className="text-xs">GitHub</span>
          </a>
          <a
            href="https://buymeacoffee.com/aquelemiguel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Support development"
          >
            <Coffee size={14} />
            <span className="text-xs">Buy me a coffee</span>
          </a>
        </div>
        <span
          style={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
          className="text-xs text-gray-300"
        >
          {version}
        </span>
      </div>
    </div>
  );
}
