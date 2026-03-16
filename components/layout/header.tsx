"use client";
export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-[#2a2a2a]">
      <div />
      <div className="flex items-center gap-3">
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Filter</button>
        <button type="button" className="text-sm text-gray-600 dark:text-gray-300">Sort</button>
        <span className="text-xs text-gray-400 dark:text-gray-500">=1</span>
        <button type="button" className="rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="Search">Q</button>
        <button type="button" className="rounded p-1.5 text-gray-500 dark:text-gray-400" aria-label="More">⋯</button>
      </div>
    </header>
  );
}
