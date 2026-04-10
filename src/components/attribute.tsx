"use client";

import { useEffect, useRef, useState } from "react";

export default function Attribute({
  className,
  labelClassName,
  valueClassName,
  label,
  value,
}: {
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  label: string;
  value: string | number;
}) {
  const [showLabel, setShowLabel] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isHidden = labelClassName?.includes("hidden");

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
      <label
        className={`
          text-gray-500
          dark:text-white
          ${labelClassName}
        `}
      >
        {label}
      </label>
      <p
        className={`
          w-10 rounded p-1 text-center text-sm font-bold
          ${valueClassName}
        `}
      >
        {value}
      </p>
    </div>
  );
}
