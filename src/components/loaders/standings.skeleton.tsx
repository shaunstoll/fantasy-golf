export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`
          flex h-10 w-full animate-pulse items-center rounded-full bg-white
          dark:bg-gray-800
        `}
      >
        <div className="ml-3 size-5 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="ml-3 h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex animate-pulse gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-6 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
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
            <div className="size-7 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-7 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2 w-30 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-7 w-10 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}
