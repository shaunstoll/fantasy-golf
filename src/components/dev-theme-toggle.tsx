"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function DevThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`
        rounded-full p-1
      `}
    >
      {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
