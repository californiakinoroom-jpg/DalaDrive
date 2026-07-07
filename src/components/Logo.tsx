// Логотип DALA DRIVE: дорога, уходящая в букву "D", + текст.
// variant: "light" — светлый текст (на тёмном фоне), "dark" — тёмный.

export function Logo({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const text = variant === "light" ? "#ffffff" : "#0e4d3c";
  const sub = variant === "light" ? "#c9a87c" : "#b08f5f";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="46"
        height="46"
        viewBox="0 0 46 46"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Скруглённый "D"-щит */}
        <path
          d="M6 4h16c11 0 18 8 18 19S33 42 22 42H6V4z"
          fill={variant === "light" ? "#ffffff" : "#0e4d3c"}
        />
        {/* Дорога, уходящая вдаль */}
        <path
          d="M14 40c1-9 4-16 9-22 3-4 7-7 11-9"
          stroke={variant === "light" ? "#0e4d3c" : "#ffffff"}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Разметка на дороге */}
        <path
          d="M17 38c1-6 3-11 6-15"
          stroke={sub}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2 3"
          fill="none"
        />
      </svg>

      <div className="leading-none">
        <div
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: text }}
        >
          DALA
        </div>
        <div
          className="text-sm font-medium tracking-[0.35em]"
          style={{ color: sub }}
        >
          DRIVE
        </div>
      </div>
    </div>
  );
}
