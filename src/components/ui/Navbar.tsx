"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "About", href: "/#about" },
  { label: "Community", href: "/#community" },
  { label: "Sign In", href: "/signin" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: isTransparent ? "transparent" : "rgba(255,255,255,0.97)",
        backdropFilter: isTransparent ? "none" : "blur(12px)",
        borderBottom: isTransparent ? "none" : "1px solid #E8E8E8",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="tracking-tight transition-opacity hover:opacity-70 font-display"
          style={{
            fontSize: "1.375rem",
            fontWeight: 600,
            color: isTransparent ? "#fff" : "#0a0a0a",
            letterSpacing: "-0.02em",
            textDecoration: "none",
          }}
        >
          Affinity
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-opacity hover:opacity-60"
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: isTransparent ? "rgba(255,255,255,0.85)" : "#3a3a3a",
                letterSpacing: "0.01em",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => router.push("/explore")}
            className="transition-all duration-200"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "0.5rem 1.25rem",
              backgroundColor: isTransparent ? "#fff" : "#0a0a0a",
              color: isTransparent ? "#0a0a0a" : "#fff",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            GET STARTED
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-1"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ color: isTransparent ? "#fff" : "#0a0a0a", background: "none", border: "none", cursor: "pointer" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.97)", borderTop: "1px solid #E8E8E8" }}
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{ fontSize: "1rem", color: "#0a0a0a", fontWeight: 400, textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => router.push("/explore")}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              padding: "0.75rem 1.25rem",
              backgroundColor: "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            GET STARTED
          </button>
        </div>
      )}
    </header>
  );
}
