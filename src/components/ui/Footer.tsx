import Link from "next/link";
import { Instagram, Twitter, Github } from "lucide-react";

const footerLinks = [
  {
    heading: "Platform",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Messages", href: "/messages" },
      { label: "Sign In", href: "/signin" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Careers", href: "/" },
      { label: "Blog", href: "/" },
      { label: "Press", href: "/" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/" },
      { label: "Terms of Service", href: "/" },
      { label: "Cookie Policy", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #E8E8E8", backgroundColor: "#fff" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <span
              className="font-display"
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#0a0a0a",
                letterSpacing: "-0.02em",
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              Affinity
            </span>
            <p style={{ fontSize: "0.8125rem", color: "#888", lineHeight: 1.7, maxWidth: "220px" }}>
              Where shared interests become genuine connections.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram, Twitter, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="transition-opacity hover:opacity-40"
                  style={{ color: "#0a0a0a" }}
                  aria-label={["Instagram", "Twitter", "Github"][i]}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#aaa",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-opacity hover:opacity-50"
                      style={{ fontSize: "0.875rem", color: "#444", textDecoration: "none" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid #F0F0F0" }}
        >
          <p style={{ fontSize: "0.75rem", color: "#bbb" }}>
            © 2026 Affinity. All rights reserved.
          </p>
          <p style={{ fontSize: "0.75rem", color: "#bbb" }}>
            Designed for human connection.
          </p>
        </div>
      </div>
    </footer>
  );
}
