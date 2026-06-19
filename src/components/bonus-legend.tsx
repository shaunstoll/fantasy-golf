"use client";

import { Info, X } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/button";

const SEEN_KEY = "fantasy-golf:bonus-legend-seen";

const dots = [
  {
    color: "bg-amber-400",
    label: "Winner",
    desc: "A pick finished 1st outright — worth a +15 bonus.",
  },
  {
    color: "bg-green-500",
    label: "Made cut",
    desc: "Made-cut bonus earned (a team earns it only when every pick makes the cut).",
  },
  {
    color: "bg-purple-500",
    label: "Lowest ranked",
    desc: "The lowest-ranked player to finish inside the top 25 — worth a +15 bonus.",
  },
];

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
              {dots.map((d) => (
                <li key={d.label} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-3 shrink-0 rounded-full ${d.color}`} />
                  <div>
                    <p className="font-semibold">{d.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{d.desc}</p>
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
