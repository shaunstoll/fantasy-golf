export default function Button({
  className,
  style,
  children,
  onClick,
  type,
  title,
  disabled,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={`${className} ${disabled ? "cursor-default" : "transition ease-in-out active:scale-95 cursor-pointer"}`}
      style={style}
      onClick={onClick}
      type={type ?? "button"}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
