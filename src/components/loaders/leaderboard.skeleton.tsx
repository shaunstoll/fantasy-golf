const shimmer = "bg-gray-200 dark:bg-gray-700";

/**
 * Loading placeholder for the tournament leaderboard: a search bar, the column
 * header (sort controls + Hide Unowned), then player rows (flag over place,
 * two-line name, and the Rank/Owned/Thru/Score/Points attribute cluster).
 */
export default function LeaderboardSkeleton() {
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

      {/* Column header */}
      <div
        className={`
          flex h-9 animate-pulse items-center justify-between gap-1 rounded
          bg-white px-2
          dark:bg-gray-800
        `}
      >
        <div className={`h-4 w-28 rounded-full ${shimmer}`} />
        <div className="flex shrink-0 items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`h-3 w-10 rounded-full ${shimmer}`} />
          ))}
        </div>
      </div>

      {/* Player rows */}
      {Array.from({ length: 14 }).map((_, index) => (
        <div
          key={index}
          className={`
            flex h-12 animate-pulse items-center justify-between gap-1 rounded
            bg-white p-1 pr-2
            dark:bg-gray-800
          `}
        >
          <div className="flex min-w-0 items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`size-5 rounded-full ${shimmer}`} />
              <div className={`h-3 w-7 rounded ${shimmer}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className={`h-2.5 w-16 rounded-full ${shimmer}`} />
              <div className={`h-3.5 w-24 rounded-full ${shimmer}`} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, box) => (
              <div key={box} className={`h-9 w-10 rounded ${shimmer}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
