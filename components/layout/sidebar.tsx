"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useState } from "react";

const navSections = [
  { abbr: "Pr", label: "Property Searches", href: "/property-searches", sub: [{ label: "Buyers", href: "/property-searches" }] },
  { abbr: "Bu", label: "Buyer Management", href: "/buyers", sub: [{ label: "Buyer Management", href: "/buyers" }] },
  { abbr: "Ad", label: "Address Search", href: "/address-search", sub: [{ label: "LA Property Map", href: "/address-search" }] },
  { abbr: "Se", label: "Seller Leads", href: "/seller-leads", sub: [{ label: "Seller Leads List", href: "/seller-leads" }] },
] as const;

function NavLink({ href, isActive, children, className = "" }: { href: string; isActive: boolean; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={"flex items-center gap-2 border-l-[3px] py-2 pr-3 pl-3 text-sm font-medium rounded-r-md " +
        (isActive ? "border-sidebar-active-border bg-sidebar-active-bg text-sidebar-text dark:border-sidebar-dark-active-border dark:bg-sidebar-dark-active-bg dark:text-sidebar-dark-text" :
          "border-transparent text-sidebar-text-muted hover:bg-sidebar-active-bg/60 hover:text-sidebar-text dark:text-sidebar-dark-text-muted dark:hover:bg-sidebar-dark-active-bg/80 dark:hover:text-sidebar-dark-text dark:border-transparent dark:bg-transparent") + " " + className}
    >
      {children}
    </Link>
  );
}

function UserMenu({ userName = "User" }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = userName ?? "User";
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) { document.addEventListener("click", handleClickOutside); return () => document.removeEventListener("click", handleClickOutside); }
  }, [open]);
  return (
    <div className="relative" ref={menuRef}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-sidebar-active-bg/60 dark:hover:bg-sidebar-dark-active-bg/80" aria-expanded={open} aria-haspopup="true" aria-label="User menu">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-medium text-white">{displayName.charAt(0).toUpperCase()}</div>
        <span className="min-w-0 flex-1 truncate text-sidebar-text-muted dark:text-sidebar-dark-text-muted">{displayName}</span>
        <span className={"shrink-0 text-sidebar-text-muted transition-transform dark:text-sidebar-dark-text-muted " + (open ? "rotate-180" : "")}>⌄</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#2a2a2a]" role="menu">
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <p className="truncate text-sm font-medium text-sidebar-text dark:text-sidebar-dark-text">{displayName}</p>
          </div>
          <button type="button" onClick={() => { setOpen(false); window.location.href = "/sign-in"; }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30" role="menuitem">Log out</button>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r border-gray-200 bg-sidebar-bg dark:border-gray-700 dark:bg-sidebar-dark-bg">
      <div className="flex h-14 items-center gap-1.5 border-b border-gray-200 px-4 dark:border-gray-700">
        <span className="text-lg" aria-hidden>🏠</span>
        <Link href="/" className="flex items-center gap-0 text-sidebar-text dark:text-sidebar-dark-text">
          <span className="font-normal">Property</span><span className="font-bold">Matchmaker</span>
        </Link>
        <span className="text-sidebar-text-muted dark:text-sidebar-dark-text-muted" aria-hidden>⌄</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0 p-2">
        {navSections.map(({ abbr, label, href, sub }) => {
          const isParentActive = pathname === href || pathname.startsWith(href + "/");
          const hasSub = sub.length > 0;
          const isParentLinkActive = isParentActive && !hasSub;
          return (
            <div key={href} className="flex flex-col gap-0">
              <NavLink href={href} isActive={isParentLinkActive} className="pl-3">
                <span className="w-6 shrink-0 text-xs font-semibold uppercase text-sidebar-text-muted dark:text-sidebar-dark-text-muted">{abbr}</span>
                {label}
              </NavLink>
              {hasSub && sub.map((s) => (
                <NavLink key={s.href + s.label} href={s.href} isActive={pathname === s.href} className="ml-4 pl-2 py-1.5 text-sm">{s.label}</NavLink>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 bg-sidebar-bg p-3 dark:border-gray-700 dark:bg-sidebar-dark-bg">
        <UserMenu />
      </div>
    </aside>
  );
}
