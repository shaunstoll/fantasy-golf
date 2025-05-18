import Image from "next/image";
import icon from "@/images/yufa.icon.webp";
import creator from "@/images/creator.webp";
import Button from "./button";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between text-sm">
      <div className="flex items-center">
        <Image src={creator} alt="Creator" width={48} height={48} />
        <div className="flex flex-col">
          <p>Have a Suggestion?</p>
          <div className="flex items-center gap-1">
            <p>Add to</p>
            <a
              href="https://docs.google.com/document/d/1IoVKiXxCSxYxK7cnZSOv5yt_SjMM3whs3bG68esie1I/edit?usp=sharing"
              target="_blank"
            >
              <Button className="underline">Google Doc</Button>
            </a>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 pr-1">
        <Image src={icon} alt="YUFA" width={48} height={48} />
        <div className="flex flex-col">
          <p>Play Fantasy Football?</p>
          <div className="flex items-center gap-1">
            <p>Checkout</p>
            <a href="https://yufa.app/" target="_blank">
              <Button className="underline">YUFA</Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
