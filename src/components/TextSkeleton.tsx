import React from "react";

type Props = {
  /** Количество серых полосок */
  lines?: number;
  className?: string;
};

/** Плейсхолдер пока ИИ генерирует текст — без скачков вёрстки */
export function TextSkeleton({ lines = 3, className = "" }: Props) {
  return (
    <div
      className={`space-y-2.5 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Генерация текста"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
          style={{
            width: `${Math.max(42, 94 - i * 16)}%`,
            animationDuration: `${1.1 + i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}
