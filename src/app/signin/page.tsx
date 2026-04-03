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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >


      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />

      <div
        className="w-full max-w-md mx-auto px-6"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="font-display inline-block transition-opacity hover:opacity-70"
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "-0.02em",
              textDecoration: "none",
            }}
          >
            Affinity
          </Link>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "rgba(255,255,255,0.4)",
              marginTop: "0.75rem",
              fontWeight: 300,
            }}
          >
            Welcome back. Sign in to continue.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "2.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "0.625rem",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9375rem",
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: "0.625rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    fontSize: "0.9375rem",
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                    padding: 0,
                    display: "flex",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  fontSize: "0.8125rem",
                  color: "#ff6b6b",
                  backgroundColor: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.15)",
                  borderRadius: "4px",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
              style={{
                width: "100%",
                padding: "0.875rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                backgroundColor: "#fff",
                color: "#0a0a0a",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                marginTop: "0.5rem",
              }}
            >
              {loading ? "SIGNING IN…" : "SIGN IN"} {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Divider */}
          <div
            className="flex items-center gap-4 my-6"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "0.6875rem", letterSpacing: "0.06em" }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* OAuth placeholder */}
          <button
            type="button"
            className="flex items-center justify-center gap-3 transition-all hover:border-white/20"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
              backgroundColor: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              cursor: "pointer",
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
        </div>

        {/* Footer link */}
        <p
          className="text-center mt-8"
          style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.35)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="transition-opacity hover:opacity-70"
            style={{
              color: "#fff",
              fontWeight: 500,
              textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
