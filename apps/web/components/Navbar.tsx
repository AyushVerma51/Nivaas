"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-ink/10 bg-ink transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <nav className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between px-6 py-3 sm:px-8 lg:px-12">
        <Link href="/" className="font-display text-2xl tracking-tight text-cream">
          Estately
        </Link>
        <div className="flex items-center gap-4 lg:gap-5">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`hidden text-xs lg:text-sm font-medium tracking-wide whitespace-nowrap transition-colors sm:block ${
                  active ? "text-clay" : "text-cream/70 hover:text-cream"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
