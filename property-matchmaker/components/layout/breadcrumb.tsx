import Link from "next/link";
type Segment = { label: string; href?: string };
export function Breadcrumb({ segments }: { segments: Segment[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 dark:text-gray-300">
      {segments.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-400 dark:text-gray-500">/</span>}
          {s.href ? (
            <Link href={s.href} className="hover:text-gray-900 dark:hover:text-white">{s.label}</Link>
          ) : (
            <span className="font-medium text-gray-900 dark:text-gray-200">{s.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
