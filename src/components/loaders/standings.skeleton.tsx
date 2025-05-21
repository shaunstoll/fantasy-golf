import Attribute from "../attribute";

export default function StandingsSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 29 }).map((_, index) => (
        <div
          key={index}
          className="h-16 w-full bg-white dark:bg-gray-800 rounded-md animate-pulse flex justify-between p-2"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Attribute
              label="Rank"
              value={index + 1}
              labelClassName="text-sm"
              valueClassName={
                index === 0
                  ? "bg-amber-200 text-amber-800"
                  : index === 1
                    ? "bg-slate-200 text-slate-800"
                    : index === 2
                      ? "bg-orange-200 text-orange-800"
                      : "bg-gray-600 text-white"
              }
            />
            <div className="h-4 w-40 bg-gray-500 rounded-full" />
          </div>
          <Attribute
            label="Points"
            labelClassName="text-sm"
            valueClassName="bg-gray-200 text-black"
            value={"-"}
          />
        </div>
      ))}
    </div>
  );
}
