"use client";

import { Search, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: Props) {
  return (
    <div className="flex items-center rounded-full bg-white dark:bg-gray-800">
      <Search className="ml-3 size-5 shrink-0 opacity-50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-2 text-base outline-none"
      />
      {value && (
        <button type="button" className="pr-3" onClick={() => onChange("")}>
          <X className="size-5 shrink-0 opacity-50" />
        </button>
      )}
    </div>
  );
}
