"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { HeroMiniAvatars } from "@/components/ui/HeroCards";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function HeroSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      router.push("/explore");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    fontSize: "0.8125rem",
    color: "#1a1a2e",
    backgroundColor: "#f7f7f9",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "12px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "2.5rem",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.04)",
        width: 480,
      }}
    >
      <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.25rem" }}>
        Sign in
      </p>
      <p style={{ fontSize: "0.8125rem", color: "#a1a1aa", marginBottom: "1.5rem" }}>
        Access your companion network.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em", color: "#a1a1aa", textTransform: "uppercase" as const, marginBottom: "0.375rem" }}>
            Email
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required autoComplete="email" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.06)")}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em", color: "#a1a1aa", textTransform: "uppercase" as const, marginBottom: "0.375rem" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
              autoComplete="current-password" style={{ ...inputStyle, paddingRight: "3rem" }}
              onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.06)")}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: 0, display: "flex" }}
              aria-label={showPassword ? "Hide" : "Show"}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "0.75rem", color: "#ef4444", backgroundColor: "#fef2f2", padding: "0.5rem 0.75rem", borderRadius: "8px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
          style={{
            width: "100%", padding: "0.75rem", fontSize: "0.8125rem", fontWeight: 600,
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
            color: "#fff", border: "none", borderRadius: "14px",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          }}>
          {loading ? "Signing in…" : "Sign In"} {!loading && <ArrowRight size={14} />}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4" style={{ color: "#e5e5e5" }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
        <span style={{ fontSize: "0.625rem", letterSpacing: "0.06em", color: "#bbb" }}>OR</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
      </div>

      {/* OAuth */}
      <button type="button"
        className="flex items-center justify-center gap-2.5 transition-all hover:bg-gray-50"
        style={{
          width: "100%", padding: "0.65rem", fontSize: "0.8125rem", fontWeight: 500,
          color: "#555", backgroundColor: "#fff",
          border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", cursor: "pointer",
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center mt-4" style={{ fontSize: "0.8125rem", color: "#a1a1aa" }}>
        No account?{" "}
        <Link href="/signup" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const isLoggedIn = !authLoading && !!user;

  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left — text */}
          <div style={{ maxWidth: 560, flex: 1 }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-6"
              style={{
                padding: "0.35rem 1rem",
                border: "1px solid #e9e5f5",
                borderRadius: "24px",
                backgroundColor: "#f5f3ff",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#7c3aed",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Connection Redefined
              </span>
            </div>

            <h1
              className="font-sans"
              style={{
                fontSize: "clamp(2.75rem, 5vw, 4.25rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: "1.5rem",
              }}
            >
              Find Your{" "}
              <span style={{ color: "#7c3aed" }}>
                Kindred
              </span>
              <br />
              Spirit.
            </h1>

            <p
              style={{
                fontSize: "1.0625rem",
                color: "#71717a",
                lineHeight: 1.7,
                maxWidth: 440,
                marginBottom: "2rem",
                fontWeight: 400,
              }}
            >
              Affinity is the premier network for curated social
              discovery. Connect through shared passions,
              elevated experiences, and meaningful niches.
            </p>

            {isLoggedIn && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => router.push("/explore")}
                  className="flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    padding: "0.875rem 2rem",
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "28px",
                    cursor: "pointer",
                  }}
                >
                  Get Started <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push("/explore")}
                  className="transition-all duration-200 hover:bg-gray-50"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "0.875rem 2rem",
                    backgroundColor: "transparent",
                    color: "#1a1a2e",
                    border: "1.5px solid #1a1a2e",
                    borderRadius: "28px",
                    cursor: "pointer",
                  }}
                >
                  Explore Communities
                </button>
              </div>
            )}

            <HeroMiniAvatars />
          </div>

          {/* Right — sign-in form (logged out) or nothing */}
          {!isLoggedIn && !authLoading && (
            <div className="hidden lg:flex items-center justify-center" style={{ flexShrink: 0, width: 480 }}>
              <HeroSignInForm />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
