"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/button";
import { bonuses } from "@/config/bonuses";

const SEEN_KEY = "fantasy-golf:bonus-legend-seen";

export default function BonusLegend() {
  const [open, setOpen] = useState(false);

  // Auto-open once for first-time visitors, then remember they've seen it.
  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
  }, []);

  // Lock background scroll while the modal is open so it can't move behind it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    localStorage.setItem(SEEN_KEY, "1");
  };

  return (
    <>
      <Button
        className="absolute right-0 p-1 text-gray-500 dark:text-gray-400"
        onClick={() => setOpen(true)}
        aria-label="Bonus legend"
      >
        <Info className="size-6" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            className={`
              w-full max-w-sm rounded-lg bg-white p-4 text-left shadow-xl
              dark:bg-gray-800
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Bonus legend</h2>
              <Button onClick={close} aria-label="Close legend" className="p-1">
                <X className="size-5" />
              </Button>
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {bonuses.map((b) => (
                <li key={b.key} className="flex items-start gap-3">
                  <span className={`w-4 shrink-0 text-center text-base font-bold ${b.colorClass}`}>
                    {b.letter}
                  </span>
                  <div>
                    <p className="font-semibold">{b.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{b.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
