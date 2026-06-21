"use client";

import { useEffect, useRef, useState } from "react";

export default function Attribute({
  className,
  labelClassName,
  valueClassName,
  label,
  value,
  focused,
  hideLabel,
  widthClassName = "w-10",
}: {
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  label: string;
  value: string | number;
  // When explicitly false, the attribute fades back (e.g. a score column that
  // isn't the active sort). Undefined or true leaves it at full strength.
  focused?: boolean;
  // Drop the stacked label entirely — used when a shared header row already
  // titles the columns (teams, roster/leaderboard players). The native `title`
  // tooltip is kept for hover accessibility.
  hideLabel?: boolean;
  // Width of the value box. Defaults to w-10; teams use a touch wider so the
  // longer header labels (e.g. "Masters") fit their column at text-xs.
  widthClassName?: string;
}) {
  const [showLabel, setShowLabel] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isHidden = !hideLabel && labelClassName?.includes("hidden");

  useEffect(() => {
    if (!showLabel) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setShowLabel(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showLabel]);

  return (
    <div
      ref={ref}
      className={`
        relative flex flex-col items-center
        ${className}
      `}
      title={label}
      onClick={isHidden ? () => setShowLabel(!showLabel) : undefined}
    >
      {showLabel && isHidden && (
        <div
          className={`
            absolute bottom-full z-50 mb-1 rounded bg-gray-900 px-2 py-1 text-xs
            whitespace-nowrap text-white shadow-2xl
            dark:bg-white dark:text-black
          `}
        >
          {label}
        </div>
      )}
      {!hideLabel && (
        <label
          className={`
            text-gray-500
            dark:text-white
            ${labelClassName}
          `}
        >
          {label}
        </label>
      )}
      {/* When not focused, fade the value box (fill + number); the label/title
          above stays at full strength so you can still read what it is. */}
      <p
        className={`
          ${widthClassName} rounded p-1 text-center text-sm font-bold
          ${focused === false ? "opacity-40" : ""}
          ${valueClassName}
        `}
      >
        {value}
      </p>
    </div>
  );
}
