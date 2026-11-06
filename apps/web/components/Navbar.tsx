"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Atlas India", href: "/atlas" },
  { label: "States", href: "/atlas/states" },
  { label: "Destinations", href: "/atlas/destinations" },
  { label: "Experiences", href: "/atlas/experiences" },
  { label: "Map", href: "/atlas/map" },
  { label: "Journey", href: "/atlas/journey" },
  { label: "Search", href: "/atlas/search" },
  { label: "City Guides", href: "/city-guide" },
  { label: "Price Prediction", href: "/predict" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive(href) ? "text-clay" : "text-cream/70 hover:text-cream"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-ink/10 bg-ink transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
        <Link href="/" className="font-display text-2xl tracking-tight text-cream">
          Nivaas
        </Link>
        <div className="hidden items-center gap-4 xl:flex 2xl:gap-5">
          {links.map((l) => {
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`${linkClass(l.href)} whitespace-nowrap text-xs 2xl:text-sm`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-cream transition-colors hover:bg-cream/10 xl:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>
      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-cream/10 px-6 py-3 xl:hidden sm:px-8">
          <nav aria-label="Main navigation" className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`${linkClass(l.href)} rounded-md px-2 py-3`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
