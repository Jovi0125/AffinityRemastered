"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, User, MessageCircle, Bell, Compass, Moon, Sun } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

const navLinks = [
  { label: "Discover", href: "/explore", icon: Compass },
  { label: "Messages", href: "/messages", icon: MessageCircle },
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
  const { theme, toggleTheme } = useTheme();

  const isLoggedIn = !loading && !!user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

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

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/explore") return pathname === "/explore";
    if (href === "/messages") return pathname === "/messages";
    return false;
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: theme === "dark" ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`
          : "1px solid transparent",
        boxShadow: scrolled ? (theme === "dark" ? "0 1px 8px rgba(0,0,0,0.3)" : "0 1px 8px rgba(0,0,0,0.04)") : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="transition-opacity hover:opacity-70 flex items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <img
            src="/AffinityA.png"
            alt="Affinity"
            style={{ height: 36, width: "auto" }}
          />
          <span
            className="font-sans"
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: theme === "dark" ? "#e7e9ea" : "#1a1a2e",
              letterSpacing: "-0.03em",
            }}
          >
            Affinity
          </span>
        </Link>



        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
              {/* Nav icon buttons */}
              {navLinks.map((item) => {
                if (item.label === "Messages" && !isLoggedIn) return null;
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className="transition-all duration-200"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      backgroundColor: active ? (theme === "dark" ? "rgba(168,85,247,0.15)" : "#f0ebff") : "transparent",
                      color: active ? "#7c3aed" : (theme === "dark" ? "#71767b" : "#888"),
                      textDecoration: "none",
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  </Link>
                );
              })}

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                className="transition-all duration-200"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  backgroundColor: "transparent",
                  color: theme === "dark" ? "#e7e9ea" : "#888",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Find Companion CTA */}
              <button
                onClick={() => router.push("/explore")}
                className="transition-all duration-200 hover:shadow-lg"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  padding: "0.5rem 1.25rem",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "24px",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                Find Companion
              </button>

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
                    color: theme === "dark" ? "#71767b" : "#555",
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
                        backgroundColor: "#7c3aed",
                        color: "#fff",
                        fontSize: "0.5625rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid #fff",
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
                      backgroundColor: theme === "dark" ? "#16181c" : "#fff",
                      border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                      borderRadius: "16px",
                      boxShadow: theme === "dark" ? "0 12px 40px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,0,0,0.12)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f0f0f0" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: theme === "dark" ? "#e7e9ea" : "#1a1a2e" }}>Notifications</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: "0.6875rem", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
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
                            className="flex items-start gap-3 w-full text-left transition-colors hover:bg-purple-50"
                            style={{
                              padding: "0.75rem 1rem",
                              background: notif.read ? "transparent" : "rgba(124,58,237,0.04)",
                              border: "none",
                              borderBottom: "1px solid #F8F8F8",
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
                                  width: 32, height: 32, borderRadius: "50%", backgroundColor: "#ede9fe",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "0.6875rem", fontWeight: 600, color: "#7c3aed", flexShrink: 0,
                                }}
                              >
                                {(notif.actor?.full_name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "0.8125rem", color: "#1a1a2e", lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 500 }}>{notif.actor?.full_name || "Someone"}</span>{" "}
                                <span style={{ color: "#666" }}>{notif.message}</span>
                              </p>
                              <p style={{ fontSize: "0.6875rem", color: "#bbb", marginTop: "0.2rem" }}>
                                {formatNotifTime(notif.created_at)}
                              </p>
                            </div>
                            {!notif.read && (
                              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#7c3aed", flexShrink: 0, marginTop: 6 }} />
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
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #ede9fe",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
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
                      backgroundColor: theme === "dark" ? "#16181c" : "#fff",
                      border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                      borderRadius: "16px",
                      boxShadow: theme === "dark" ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                  >
                    {/* User info */}
                    <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid #F0F0F0" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: theme === "dark" ? "#e7e9ea" : "#1a1a2e", marginBottom: "0.15rem" }}>
                        {displayName}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: theme === "dark" ? "#71767b" : "#aaa" }}>
                        {user?.email}
                      </p>
                    </div>

                    {/* Links */}
                    <div style={{ padding: "0.375rem 0" }}>
                      <Link
                        href="/me"
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center gap-2.5 transition-colors ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-purple-50"}`}
                        style={{
                          padding: "0.625rem 1rem",
                          fontSize: "0.8125rem",
                          color: theme === "dark" ? "#e7e9ea" : "#333",
                          textDecoration: "none",
                        }}
                      >
                        <User size={14} color="#7c3aed" />
                        My Profile
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 transition-colors hover:bg-purple-50"
                        style={{
                          padding: "0.625rem 1rem",
                          fontSize: "0.8125rem",
                          color: "#333",
                          textDecoration: "none",
                        }}
                      >
                        <MessageCircle size={14} color="#7c3aed" />
                        Messages
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div style={{ borderTop: "1px solid #F0F0F0", padding: "0.375rem 0" }}>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full transition-colors hover:bg-red-50"
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
              </div>
          ) : (
            /* Logged out CTA */
            <button
              onClick={() => router.push("/signin")}
              className="transition-all duration-200 hover:shadow-lg"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                padding: "0.5rem 1.5rem",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-1"
          onClick={() => setMobileOpen((v) => !v)}
          style={{ color: "#1a1a2e", background: "none", border: "none", cursor: "pointer" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ backgroundColor: "rgba(255,255,255,0.98)", borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          {navLinks.map((item) => {
            if (item.label === "Messages" && !isLoggedIn) return null;
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2"
                style={{
                  fontSize: "1rem",
                  color: active ? "#7c3aed" : "#1a1a2e",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <>
              <Link
                href="/me"
                style={{ fontSize: "1rem", color: "#1a1a2e", fontWeight: 400, textDecoration: "none" }}
              >
                My Profile
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  padding: "0.75rem 1.25rem",
                  backgroundColor: "transparent",
                  color: "#888",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "24px",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/signin")}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                padding: "0.75rem 1.25rem",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
