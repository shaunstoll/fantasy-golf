const shimmer = "bg-gray-200 dark:bg-gray-700";

/**
 * Loading placeholder for the team standings: a search bar, the column-sort
 * header, then team rows (favorite star, rank badge, two-line name, and the
 * four-major + Total score cluster).
 */
export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {/* Search bar */}
      <div
        className={`
          flex h-10 w-full animate-pulse items-center rounded-full bg-white
          dark:bg-gray-800
        `}
      >
        <div className={`ml-3 size-5 rounded-full ${shimmer}`} />
        <div className={`ml-3 h-4 w-32 rounded-full ${shimmer}`} />
      </div>

      {/* Column-sort header */}
      <div className="flex animate-pulse items-center">
        <div className="h-9 w-10 shrink-0 rounded-l bg-white dark:bg-gray-800" />
        <div
          className={`
            flex h-9 w-full items-center justify-between gap-2 rounded-r
            bg-white px-2
            dark:bg-gray-800
          `}
        >
          <div className={`h-3 w-10 rounded-full ${shimmer}`} />
          <div className="flex shrink-0 items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={`h-3 w-10 rounded-full ${shimmer}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Team rows */}
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center">
          <div
            className={`
              flex h-16 items-center justify-center rounded-l bg-white p-2 shadow
              dark:bg-gray-800
            `}
          >
            <div className={`size-6 rounded ${shimmer}`} />
          </div>
          <div
            className={`
              flex h-16 w-full items-center justify-between gap-2 rounded-r
              bg-white p-2 shadow
              dark:bg-gray-800
            `}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={`h-9 w-10 shrink-0 rounded ${shimmer}`} />
              <div className="flex flex-col gap-1.5">
                <div className={`h-2.5 w-12 rounded-full ${shimmer}`} />
                <div className={`h-3.5 w-24 rounded-full ${shimmer}`} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {Array.from({ length: 5 }).map((_, box) => (
                <div key={box} className={`h-9 w-10 rounded ${shimmer}`} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
