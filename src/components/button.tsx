import { cn } from "@/utils/general.utils";

export default function Button({
  className,
  style,
  children,
  onClick,
  type,
  disabled,
  ...props
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      {...props}
      className={cn(
        className,
        disabled
          ? "cursor-default"
          : `
            cursor-pointer transition ease-in-out
            active:scale-95
          `,
      )}
      style={style}
      onClick={onClick}
      type={type ?? "button"}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
