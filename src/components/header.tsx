import Image from "next/image";
import logo from "@/images/logo.webp";

export default function Header() {
  return (
    <header className="flex items-center justify-center gap-1">
      <Image
        className="rounded-full"
        src={logo}
        alt="Frankel Fantasy Golf"
        width={32}
        height={32}
      />
      <h1 className="text-2xl font-bold">Fantasy Golf</h1>
    </header>
  );
}
