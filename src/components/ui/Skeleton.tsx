import clsx from "clsx";

export default function Skeleton({
  lines = 3,
  className,
}: { lines?: number; className?: string }) {
  return (
    <div className={clsx("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded bg-gray-200" />
      ))}
    </div>
  );
}
