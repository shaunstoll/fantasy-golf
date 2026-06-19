import Image from "next/image";

import BonusLegend from "@/components/bonus-legend";
import logo from "@/images/logo.webp";

export default function Header() {
  return (
    <header className="relative flex items-center justify-center gap-1">
      <Image className="w-8 rounded-full" src={logo} alt="Fantasy Golf" />
      <h1 className="text-2xl font-bold">Fantasy Golf</h1>
      <BonusLegend />
    </header>
  );
}
