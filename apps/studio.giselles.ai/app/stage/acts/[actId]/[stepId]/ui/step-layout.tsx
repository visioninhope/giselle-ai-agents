"use client";

import type { ReactNode } from "react";
import { Copy, Download, CheckCircle } from "lucide-react";
import { useState } from "react";

interface StepLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function StepLayout({ header, children }: StepLayoutProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      // Get the text content from the main content area
      const mainContent = document.querySelector('main [class*="max-w-"]');
      if (mainContent) {
        const textContent = mainContent.textContent || "";
        await navigator.clipboard.writeText(textContent);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <header className="bg-gray-900/80 p-[16px] flex items-center justify-between">
        {header}
        <div className="flex items-center">
          <button
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
            title={copyFeedback ? "Copied!" : "Copy content"}
            onClick={handleCopyToClipboard}
          >
            {copyFeedback ? (
              <CheckCircle className="size-4 text-green-400" />
            ) : (
              <Copy className="size-4 text-white/70 group-hover:text-white transition-colors" />
            )}
          </button>
          <button
            type="button"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title="Download content"
          >
            <Download className="size-4 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </div>
      </header>
      <main className="p-[16px] overflow-y-auto">
        <div className="max-w-[600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
