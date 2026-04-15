"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/explore");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#1a1a2e",
    backgroundColor: "#f7f7f9",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#a1a1aa",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side — branding */}
      <div
        className="hidden lg:flex flex-col justify-center px-16"
        style={{
          width: "50%",
          background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 mb-10" style={{ textDecoration: "none" }}>
          <img src="/AffinityA.png" alt="Affinity" style={{ height: 40, width: "auto" }} />
          <span className="font-sans" style={{ fontSize: "1.375rem", fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.03em" }}>
            Affinity
          </span>
        </Link>

        <h1
          className="font-display"
          style={{
            fontSize: "3rem",
            fontWeight: 700,
            color: "#1a1a2e",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}
        >
          Welcome
          <br />
          back.
        </h1>

        <p style={{ fontSize: "1rem", color: "#71717a", lineHeight: 1.7, maxWidth: 380 }}>
          Sign in to reconnect with your companions, continue your conversations, and discover new connections.
        </p>
      </div>

      {/* Right side — form */}
      <div
        className="flex items-center justify-center flex-1 px-6"
        style={{ backgroundColor: "#fff" }}
      >
        <div className="w-full" style={{ maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2" style={{ textDecoration: "none" }}>
              <img src="/AffinityA.png" alt="Affinity" style={{ height: 36, width: "auto" }} />
              <span className="font-sans" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e" }}>
                Affinity
              </span>
            </Link>
          </div>

          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1a1a2e",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            Sign in
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: "2rem" }}>
            Enter your credentials to access your account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
              />
            </div>

            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: 0, display: "flex",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "#ef4444",
                  backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
              style={{
                width: "100%", padding: "0.875rem", fontSize: "0.875rem", fontWeight: 600,
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                color: "#fff", border: "none", borderRadius: "14px",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                marginTop: "0.25rem",
              }}
            >
              {loading ? "Signing in…" : "Sign In"} {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6" style={{ color: "#e5e5e5" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
            <span style={{ fontSize: "0.6875rem", letterSpacing: "0.06em", color: "#bbb" }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#ebebeb" }} />
          </div>

          {/* OAuth */}
          <button
            type="button"
            className="flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
            style={{
              width: "100%", padding: "0.75rem", fontSize: "0.8125rem", fontWeight: 500,
              color: "#555", backgroundColor: "#fff",
              border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center mt-8" style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="transition-opacity hover:opacity-70"
              style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
