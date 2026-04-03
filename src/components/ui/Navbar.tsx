"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const publicLinks = [
  { label: "Explore", href: "/explore" },
  { label: "About", href: "/#about" },
  { label: "Community", href: "/#community" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isTransparent = isHome && !scrolled;
  const isLoggedIn = !loading && !!user;

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  // Build nav links based on auth state
  const navLinks = [
    ...publicLinks,
    ...(isLoggedIn
      ? [{ label: "Messages", href: "/messages" }]
      : [{ label: "Sign In", href: "/signin" }]),
  ];

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

        {/* CTA / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            /* Avatar dropdown */
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      filter: "none",
                      border: isTransparent
                        ? "2px solid rgba(255,255,255,0.3)"
                        : "2px solid #E8E8E8",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: isTransparent ? "rgba(255,255,255,0.15)" : "#F0F0F0",
                      color: isTransparent ? "#fff" : "#555",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      border: isTransparent
                        ? "2px solid rgba(255,255,255,0.3)"
                        : "2px solid #E8E8E8",
                    }}
                  >
                    {initials}
                  </div>
                )}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 220,
                    backgroundColor: "#fff",
                    border: "1px solid #E8E8E8",
                    borderRadius: "6px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  {/* User info */}
                  <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid #F0F0F0" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.15rem" }}>
                      {displayName}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#aaa" }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Links */}
                  <div style={{ padding: "0.375rem 0" }}>
                    <Link
                      href="/me"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 transition-colors hover:bg-gray-50"
                      style={{
                        padding: "0.625rem 1rem",
                        fontSize: "0.8125rem",
                        color: "#333",
                        textDecoration: "none",
                      }}
                    >
                      <User size={14} color="#888" />
                      My Profile
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 transition-colors hover:bg-gray-50"
                      style={{
                        padding: "0.625rem 1rem",
                        fontSize: "0.8125rem",
                        color: "#333",
                        textDecoration: "none",
                      }}
                    >
                      <MessageCircle size={14} color="#888" />
                      Messages
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div style={{ borderTop: "1px solid #F0F0F0", padding: "0.375rem 0" }}>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full transition-colors hover:bg-gray-50"
                      style={{
                        padding: "0.625rem 1rem",
                        fontSize: "0.8125rem",
                        color: "#888",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged out CTA */
            <button
              onClick={() => router.push("/signin")}
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
          )}
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
          {isLoggedIn ? (
            <>
              <Link
                href="/me"
                style={{ fontSize: "1rem", color: "#0a0a0a", fontWeight: 400, textDecoration: "none" }}
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  padding: "0.75rem 1.25rem",
                  backgroundColor: "transparent",
                  color: "#888",
                  border: "1px solid #E8E8E8",
                  borderRadius: "2px",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                SIGN OUT
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/signin")}
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
          )}
        </div>
      )}
    </header>
  );
}
