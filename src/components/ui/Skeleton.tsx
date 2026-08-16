export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 rounded-md ${className}`}
    />
  );
}