import Image from "next/image";

import logo from "@/images/logo.webp";

export default function Header() {
  return (
    <header className="flex items-center justify-center gap-1">
      <Image className="w-8 rounded-full" src={logo} alt="Fantasy Golf" />
      <h1 className="text-2xl font-bold">Fantasy Golf</h1>
    </header>
  );
}
