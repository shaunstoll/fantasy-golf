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
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <label className={`text-gray-500 dark:text-white ${labelClassName}`}>
        {label}
      </label>
      <p
        className={`font-bold text-sm w-10 rounded p-1 text-center ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
