export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 29 }).map((_, index) => (
        <div
          key={index}
          className="h-16 w-full bg-white dark:bg-gray-800 rounded-md animate-pulse flex justify-between p-2 shadow items-center"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-7 bg-gray-200 rounded" />
            <div className="h-7 w-10 bg-gray-200 rounded" />
            <div className="h-2 w-30 bg-gray-200 rounded-full" />
          </div>
          <div className="h-7 w-10 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
