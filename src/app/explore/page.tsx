"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { PageTransition } from "@/components/ui/PageTransition";
import type { SupabaseProfile } from "@/data/profiles";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useBlocks } from "@/hooks/useBlocks";
import { calculateAffinityScore } from "@/hooks/useAffinityScore";

const categories = ["Lifestyle", "Creative", "Fitness", "Professional", "Wellness"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("Recommended");
  const [profiles, setProfiles] = useState<(SupabaseProfile & { last_seen_at?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const { user, profile: myProfile } = useAuth();
  const { blockedIds } = useBlocks();

  const supabase = createClient();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests, availability, last_seen_at")
        .order("created_at", { ascending: false });

      if (data) {
        const filtered = user
          ? data.filter((p: SupabaseProfile) => p.id !== user.id)
          : data;
        setProfiles(filtered as (SupabaseProfile & { last_seen_at?: string })[]);
      }
      setLoading(false);
    };
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const filtered = useMemo(() => {
    let result = profiles
      .filter((p) => !blockedIds.includes(p.id))
      .filter((p) => {
        const name = p.full_name || "";
        const bio = p.bio || "";
        const interests = p.interests || [];
        const matchSearch =
          !search ||
          name.toLowerCase().includes(search.toLowerCase()) ||
          bio.toLowerCase().includes(search.toLowerCase()) ||
          interests.some((i) => i.toLowerCase().includes(search.toLowerCase()));

        const matchAvailability =
          availability === "all" || (p as SupabaseProfile).availability === availability;

        return matchSearch && matchAvailability;
      });

    const myInterests = myProfile?.interests || [];
    if (sort === "Recommended" && myInterests.length > 0) {
      result = [...result].sort((a, b) => {
        const scoreA = calculateAffinityScore(myInterests, a.interests || []);
        const scoreB = calculateAffinityScore(myInterests, b.interests || []);
        return scoreB - scoreA;
      });
    } else if (sort === "Most recent") {
      result = [...result].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  }, [profiles, blockedIds, search, availability, sort, myProfile?.interests]);

  const visibleProfiles = filtered.slice(0, visibleCount);

  return (
    <PageTransition>
      <div style={{ backgroundColor: "#faf9fd", minHeight: "100vh", paddingTop: "4rem" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── Left Sidebar ─── */}
            <aside style={{ width: "100%", maxWidth: 240, flexShrink: 0 }} className="hidden lg:block">
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "1.5rem" }}>
                Filters
              </h2>

              {/* Category */}
              <div style={{ marginBottom: "1.75rem" }}>
                <p style={{
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.75rem",
                }}>
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        style={{
                          fontSize: "0.75rem", fontWeight: 500,
                          padding: "0.3rem 0.75rem",
                          border: "1px solid",
                          borderColor: active ? "#7c3aed" : "#e5e5e5",
                          borderRadius: "20px",
                          backgroundColor: active ? "#7c3aed" : "#fff",
                          color: active ? "#fff" : "#555",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div style={{ marginBottom: "1.75rem" }}>
                <p style={{
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "#a1a1aa", textTransform: "uppercase", marginBottom: "0.75rem",
                }}>
                  Availability
                </p>
                <div className="flex flex-col gap-2">
                  {["Immediate Start", "Weekends Only", "Remote Friendly"].map((opt) => {
                    const active = availability === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setAvailability(active ? "all" : opt)}
                        className="flex items-center gap-2 transition-all"
                        style={{
                          fontSize: "0.8125rem", fontWeight: active ? 500 : 400,
                          color: active ? "#7c3aed" : "#555",
                          background: "none", border: "none", cursor: "pointer",
                          padding: "0.15rem 0", textAlign: "left",
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          border: active ? "5px solid #7c3aed" : "2px solid #d4d4d8",
                          transition: "all 0.15s ease", flexShrink: 0,
                        }} />
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ─── Main Content ─── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Explore Companions
                  </h1>
                  <p style={{ fontSize: "0.9375rem", color: "#71717a", maxWidth: 420 }}>
                    Discover curated matches who share your interests, professional goals, and lifestyle rhythms.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "0.8125rem", color: "#a1a1aa" }}>Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{
                      fontSize: "0.8125rem", fontWeight: 600, color: "#1a1a2e",
                      border: "none", outline: "none",
                      backgroundColor: "transparent", cursor: "pointer",
                    }}
                  >
                    <option>Recommended</option>
                    <option>Most recent</option>
                  </select>
                </div>
              </div>

              {/* Search bar */}
              <div
                className="flex items-center gap-3 mb-6"
                style={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                  padding: "0.75rem 1.125rem",
                  backgroundColor: "#fff",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Search size={16} color="#a1a1aa" />
                <input
                  type="text"
                  placeholder="Search companions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1, border: "none", outline: "none",
                    fontSize: "0.875rem", color: "#1a1a2e", backgroundColor: "transparent",
                  }}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ color: "#ccc", border: "none", background: "none", cursor: "pointer" }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} style={{
                      borderRadius: "20px",
                      backgroundColor: "#f5f3ff",
                      height: 380,
                      animation: "shimmer 1.5s infinite linear",
                      backgroundImage: "linear-gradient(90deg, #f5f3ff 25%, #ede9fe 50%, #f5f3ff 75%)",
                      backgroundSize: "200% 100%",
                    }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <p className="font-display" style={{ fontSize: "1.5rem", color: "#c4b5fd", fontStyle: "italic", marginBottom: "0.75rem" }}>
                    No results found.
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleProfiles.map((p) => (
                      <ProfileCard key={p.id} profile={p} variant="featured" />
                    ))}
                  </div>

                  {/* Load More */}
                  {visibleCount < filtered.length && (
                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => setVisibleCount((v) => v + 6)}
                        className="flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          padding: "0.75rem 2rem",
                          backgroundColor: "#fff",
                          color: "#1a1a2e",
                          border: "1.5px solid #e5e5e5",
                          borderRadius: "28px",
                          cursor: "pointer",
                        }}
                      >
                        Load More Companions <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
