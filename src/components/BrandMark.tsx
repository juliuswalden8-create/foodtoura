import Link from "next/link";

/** Olive plate + horizon arc — hospitality / journey mark */
export function BrandMarkIcon({
  className = "h-8 w-8",
  title = "FoodToura",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <circle cx="32" cy="32" r="22" fill="#344E41" />
      <ellipse cx="32" cy="36" rx="14" ry="5" fill="#FFFDF9" />
      <ellipse cx="32" cy="35" rx="10" ry="3.5" fill="#F1ECE3" />
      <path
        d="M18 28c4-8 10-12 14-12s10 4 14 12"
        stroke="#A7B69A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="34.5" r="2.2" fill="#C9856B" />
    </svg>
  );
}

export function BrandWordmark({
  href = "/",
  tagline = false,
  className = "",
}: {
  href?: string;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <BrandMarkIcon className="h-9 w-9 shrink-0 transition group-hover:scale-[1.03]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold tracking-tight text-[#344E41] transition group-hover:text-[#2a3f34] sm:text-2xl">
          FoodToura
        </span>
        {tagline && (
          <span className="mt-1 hidden text-[11px] font-medium tracking-wide text-[#62675E] sm:block">
            Good food makes anywhere feel like home
          </span>
        )}
      </span>
    </Link>
  );
}
