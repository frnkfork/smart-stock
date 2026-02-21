"use client";

export function Header() {
  return (
    <header className="print:hidden flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {new Date().toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </span>
    </header>
  );
}
