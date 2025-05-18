export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 29 }).map((_, index) => (
        <div
          key={index}
          className="h-16 w-full bg-white dark:bg-gray-800 rounded-md animate-pulse"
        />
      ))}
    </div>
  );
}
