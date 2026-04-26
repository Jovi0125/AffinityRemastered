"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Footer() {
  const { theme } = useTheme();
  const d = theme === "dark";

  return (
    <footer style={{ backgroundColor: d ? "#000" : "#fff", borderTop: `1px solid ${d ? "rgba(255,255,255,0.08)" : "#f0f0f0"}` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-1.5">
            <img
              src="/AffinityA.png"
              alt="Affinity"
              style={{ height: 28, width: "auto" }}
            />
            <span
              className="font-sans"
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#7c3aed",
                letterSpacing: "-0.03em",
              }}
            >
              Affinity
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {["Safety Guidelines", "Privacy Policy", "Terms of Service", "Help Center"].map((label) => (
              <Link
                key={label}
                href="/"
                className="transition-opacity hover:opacity-60"
                style={{ fontSize: "0.8125rem", color: d ? "#71767b" : "#888", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize: "0.75rem", color: d ? "#333639" : "#bbb" }}>
            © 2026 Affinity Companion Network. Designed for connection.
          </p>
        </div>
      </div>
    </footer>
  );
}
