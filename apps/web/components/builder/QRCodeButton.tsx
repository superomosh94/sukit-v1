"use client";

import { useRef, useState, useEffect } from "react";
import QRCodeLib from "qrcode";

export function QRCodeButton({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCodeLib.toDataURL(url, { width: 256, margin: 1, color: { dark: "#000", light: "#fff" } }).then(setQrDataUrl);
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Preview on phone"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
        Phone Preview
      </button>
      {open && qrDataUrl && (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card p-4 shadow-lg">
          <img src={qrDataUrl} alt="QR Code" className="h-48 w-48" />
          <p className="mt-2 text-center text-xs text-muted-foreground">Scan with your phone to preview</p>
        </div>
      )}
    </div>
  );
}
