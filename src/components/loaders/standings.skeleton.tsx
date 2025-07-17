export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 29 }).map((_, index) => (
        <div
          key={index}
          className={`
            flex h-16 w-full animate-pulse items-center justify-between
            rounded-md bg-white p-2 shadow
            dark:bg-gray-800
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-7 rounded bg-gray-200" />
            <div className="h-7 w-10 rounded bg-gray-200" />
            <div className="h-2 w-30 rounded-full bg-gray-200" />
          </div>
          <div className="h-7 w-10 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
