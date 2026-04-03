"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, MessageCircle, Bell } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";

const publicLinks = [
  { label: "Explore", href: "/explore" },
  { label: "About", href: "/#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
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

  const formatNotifTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build nav links based on auth state
  const navLinks = [
    ...publicLinks,
    ...(isLoggedIn
      ? [
          { label: "Messages", href: "/messages" },
          { label: "Activity", href: "/activity" },
        ]
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
            <>
              {/* Notification bell */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="transition-opacity hover:opacity-70"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px",
                    position: "relative",
                    color: isTransparent ? "rgba(255,255,255,0.85)" : "#555",
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        fontSize: "0.5625rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid",
                        borderColor: isTransparent ? "#0a0a0a" : "#fff",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 340,
                      maxHeight: 420,
                      backgroundColor: "#fff",
                      border: "1px solid #E8E8E8",
                      borderRadius: "8px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0a0a0a" }}>Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: "0.6875rem", color: "#888", background: "none", border: "none", cursor: "pointer" }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ overflowY: "auto", maxHeight: 360 }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center" }}>
                          <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 15).map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.type === "follow") router.push(`/profile/${notif.actor_id}`);
                              if (notif.type === "message") router.push(`/messages?c=${notif.reference_id}`);
                              setNotifOpen(false);
                            }}
                            className="flex items-start gap-3 w-full text-left transition-colors hover:bg-gray-50"
                            style={{
                              padding: "0.75rem 1rem",
                              borderBottom: "1px solid #F8F8F8",
                              background: notif.read ? "transparent" : "rgba(59,130,246,0.04)",
                              border: "none",
                              borderBlockEnd: "1px solid #F8F8F8",
                              cursor: "pointer",
                            }}
                          >
                            {notif.actor?.avatar_url ? (
                              <img
                                src={notif.actor.avatar_url}
                                alt=""
                                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 32, height: 32, borderRadius: "50%", backgroundColor: "#F0F0F0",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "0.6875rem", fontWeight: 600, color: "#555", flexShrink: 0,
                                }}
                              >
                                {(notif.actor?.full_name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "0.8125rem", color: "#0a0a0a", lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 500 }}>{notif.actor?.full_name || "Someone"}</span>{" "}
                                <span style={{ color: "#666" }}>{notif.message}</span>
                              </p>
                              <p style={{ fontSize: "0.6875rem", color: "#bbb", marginTop: "0.2rem" }}>
                                {formatNotifTime(notif.created_at)}
                              </p>
                            </div>
                            {!notif.read && (
                              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6", flexShrink: 0, marginTop: 6 }} />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar dropdown */}
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
            </>
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
