"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { InterestTag } from "@/components/ui/InterestTag";
import { allInterests } from "@/data/profiles";
import type { SupabaseProfile } from "@/data/profiles";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";

const filterInterests = allInterests.slice(0, 14);
const locations = ["Anywhere", "Tokyo", "Seoul", "Barcelona", "London", "Portland", "New York", "Paris"];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [location, setLocation] = useState("Anywhere");
  const [showFilters, setShowFilters] = useState(false);
  const [profiles, setProfiles] = useState<SupabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const supabase = createClient();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests")
        .order("created_at", { ascending: false });

      if (data) {
        // Exclude current user
        const filtered = user
          ? data.filter((p: SupabaseProfile) => p.id !== user.id)
          : data;
        setProfiles(filtered as SupabaseProfile[]);
      }
      setLoading(false);
    };
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleInterest = (i: string) =>
    setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const filtered = profiles.filter((p) => {
    const name = p.full_name || "";
    const bio = p.bio || "";
    const interests = p.interests || [];
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      bio.toLowerCase().includes(search.toLowerCase()) ||
      interests.some((i) => i.toLowerCase().includes(search.toLowerCase()));
    const matchInterests = selected.length === 0 || selected.every((s) => interests.includes(s));
    const matchLocation = location === "Anywhere" || (p.location || "").includes(location);
    return matchSearch && matchInterests && matchLocation;
  });

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", paddingTop: "4rem" }}>
      {/* Page header */}
      <section style={{ padding: "6rem 0 4rem", borderBottom: "1px solid #EFEFEF" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
            Explore
          </p>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.75rem)", fontWeight: 500, color: "#0a0a0a", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: "2.5rem" }}
          >
            Find your
            <span style={{ fontStyle: "italic", color: "#aaa" }}> companions.</span>
          </h1>

          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div
              className="flex items-center gap-3"
              style={{ flex: 1, maxWidth: 480, border: "1px solid #D8D8D8", borderRadius: "4px", padding: "0.75rem 1rem" }}
            >
              <Search size={15} color="#aaa" />
              <input
                type="text"
                placeholder="Search by name, interest, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", fontSize: "0.875rem", color: "#0a0a0a", backgroundColor: "transparent" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: "#ccc", border: "none", background: "none", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.04em",
                padding: "0.75rem 1.25rem",
                backgroundColor: showFilters ? "#0a0a0a" : "transparent",
                color: showFilters ? "#fff" : "#0a0a0a",
                border: "1px solid", borderColor: showFilters ? "#0a0a0a" : "#D8D8D8",
                borderRadius: "4px", cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={14} />
              Filters
              {selected.length > 0 && (
                <span
                  style={{
                    width: 18, height: 18, borderRadius: "50%",
                    backgroundColor: showFilters ? "#fff" : "#0a0a0a",
                    color: showFilters ? "#0a0a0a" : "#fff",
                    fontSize: "0.625rem", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 600,
                  }}
                >
                  {selected.length}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #F0F0F0" }}>
              <div className="mb-5">
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.875rem" }}>
                  Location
                </p>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      style={{
                        fontSize: "0.75rem", padding: "0.3rem 0.85rem", border: "1px solid",
                        borderColor: location === loc ? "#0a0a0a" : "#E0E0E0", borderRadius: "2px",
                        backgroundColor: location === loc ? "#0a0a0a" : "transparent",
                        color: location === loc ? "#fff" : "#555", cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.875rem" }}>
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {filterInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                    >
                      <InterestTag label={interest} filled={selected.includes(interest)} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
              {selected.length > 0 && (
                <button
                  onClick={() => { setSelected([]); setLocation("Anywhere"); }}
                  style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#aaa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: "4rem 0 8rem" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p style={{ fontSize: "0.8125rem", color: "#aaa" }}>
              {loading
                ? "Loading…"
                : filtered.length === 0
                  ? "No profiles match your filters"
                  : `${filtered.length} ${filtered.length === 1 ? "person" : "people"} found`}
            </p>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "0.75rem", color: "#bbb" }}>Sort:</span>
              <select
                style={{
                  fontSize: "0.75rem", color: "#555", border: "1px solid #E0E0E0",
                  borderRadius: "3px", padding: "0.25rem 0.5rem", outline: "none",
                  backgroundColor: "#fff", cursor: "pointer",
                }}
              >
                <option>Most relevant</option>
                <option>Most recent</option>
                <option>Most connections</option>
              </select>
            </div>
          </div>

          {!loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24" style={{ borderTop: "1px solid #F0F0F0" }}>
              <p className="font-display" style={{ fontSize: "1.5rem", color: "#ccc", fontStyle: "italic", marginBottom: "0.75rem" }}>
                No results found.
              </p>
              <p style={{ fontSize: "0.875rem", color: "#ccc" }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProfileCard key={p.id} profile={p} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
