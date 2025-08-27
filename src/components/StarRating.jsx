import { useState } from "react";

export default function StarRating({ value, onChange, max = 5, size = "md" }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value ?? 0;
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

  return (
    <div role="radiogroup" aria-label="Rate" className="inline-flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= display;
        return (
          <button
            key={idx}
            role="radio"
            aria-checked={value === idx}
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange?.(value === idx ? null : idx)}
            className={`transition ${sizes[size]}`}
            title={`${idx} star${idx>1?"s":""}`}
          >
            <svg viewBox="0 0 20 20" className={filled ? "fill-yellow-400" : "fill-slate-500/40"}>
              <path d="M10 15.27l-5.18 3.05 1.64-5.64L2 8.63l5.82-.5L10 2.5l2.18 5.63 5.82.5-4.46 4.05 1.64 5.64z"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
}
