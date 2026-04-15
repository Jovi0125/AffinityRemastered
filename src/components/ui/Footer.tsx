import Link from "next/link";

export function Footer() {
  return (
    <footer className="gradient-border-top" style={{ backgroundColor: "#fff" }}>
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
                style={{ fontSize: "0.8125rem", color: "#888", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p style={{ fontSize: "0.75rem", color: "#bbb" }}>
            © 2026 Affinity Companion Network. Designed for connection.
          </p>
        </div>
      </div>
    </footer>
  );
}
