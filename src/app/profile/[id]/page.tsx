"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import { InterestTag } from "@/components/ui/InterestTag";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { FollowListModal } from "@/components/ui/FollowListModal";

import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseProfile } from "@/data/profiles";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [suggestions, setSuggestions] = useState<SupabaseProfile[]>([]);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  const supabase = createClient();

  // Redirect to /me if viewing own profile
  useEffect(() => {
    if (user && id === user.id) {
      router.replace("/me");
    }
  }, [user, id, router]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests")
        .eq("id", id)
        .single();

      if (data) {
        setProfile(data as SupabaseProfile);
      }
      setLoading(false);
    };

    const fetchSuggestions = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, cover_url, location, bio, interests")
        .neq("id", id)
        .limit(3);
      if (data) setSuggestions(data as SupabaseProfile[]);
    };

    const fetchCounts = async () => {
      const [{ count: followers }, { count: followingC }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", id),
      ]);
      setFollowerCount(followers ?? 0);
      setFollowingCount(followingC ?? 0);
    };

    fetchProfile();
    fetchSuggestions();
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check follow status
  useEffect(() => {
    if (!user || !id) return;
    const checkFollow = async () => {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", id)
        .maybeSingle();
      setFollowing(!!data);
    };
    checkFollow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const handleFollow = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    setFollowLoading(true);
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      setFollowing(true);
      setFollowerCount((c) => c + 1);
    }
    setFollowLoading(false);
  };

  const handleMessage = async () => {
    if (!user) {
      router.push("/signin");
      return;
    }
    // Find or create conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${id}),and(participant_1.eq.${id},participant_2.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      router.push(`/messages?c=${existing.id}`);
    } else {
      const { data: newConvo } = await supabase
        .from("conversations")
        .insert({ participant_1: user.id, participant_2: id })
        .select("id")
        .single();
      if (newConvo) {
        router.push(`/messages?c=${newConvo.id}`);
      }
    }
  };

  if (loading || !profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#aaa" }}>{loading ? "Loading…" : "Profile not found."}</p>
      </div>
    );
  }

  const name = profile.full_name || "Anonymous";

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Cover */}
      <div style={{ height: 320, backgroundColor: "#111", position: "relative", overflow: "hidden" }}>
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(80%) brightness(0.6)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)" }} />
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-20 left-6 lg:left-8 flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Profile section */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          style={{ marginTop: "-52px", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              style={{
                width: 104, height: 104, borderRadius: "50%", objectFit: "cover",
                border: "4px solid #fff",
                boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
              }}
            />
          ) : (
            <div
              style={{
                width: 104, height: 104, borderRadius: "50%", backgroundColor: "#F0F0F0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 600, color: "#555",
                border: "4px solid #fff", boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMessage}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.03em", padding: "0.6rem 1.25rem", backgroundColor: "transparent", color: "#0a0a0a", border: "1px solid #D8D8D8", borderRadius: "3px", cursor: "pointer" }}
            >
              <MessageCircle size={13} /> Message
            </button>
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="flex items-center gap-2 transition-all hover:opacity-80"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.03em", padding: "0.6rem 1.25rem",
                backgroundColor: following ? "transparent" : "#0a0a0a",
                color: following ? "#0a0a0a" : "#fff",
                border: "1px solid", borderColor: following ? "#D8D8D8" : "#0a0a0a",
                borderRadius: "3px", cursor: followLoading ? "not-allowed" : "pointer",
                opacity: followLoading ? 0.6 : 1,
              }}
            >
              {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h1
              className="font-display"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}
            >
              {name}
            </h1>
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={13} color="#aaa" />
              <span style={{ fontSize: "0.8125rem", color: "#aaa" }}>{profile.location || "Unknown"}</span>
            </div>
            <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75, maxWidth: 520, marginBottom: "1.75rem", fontWeight: 300 }}>
              {profile.bio || "No bio yet."}
            </p>

            {(profile.interests?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.875rem" }}>
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <InterestTag key={interest} label={interest} size="md" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats sidebar */}
          <div>
            <div style={{ border: "1px solid #EFEFEF", borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Followers", value: followerCount, key: "followers" as const },
                { label: "Following", value: followingCount, key: "following" as const },
              ].map((stat, i) => (
                <button
                  key={stat.label}
                  onClick={() => setFollowModal(stat.key)}
                  className="flex items-center justify-between py-3 w-full"
                  style={{
                    borderTop: i > 0 ? "1px solid #F5F5F5" : "none",
                    background: "none",
                    border: i > 0 ? undefined : "none",
                    borderBottom: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    cursor: "pointer",
                    padding: "0.75rem 0",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span style={{ fontSize: "0.8125rem", color: "#999" }}>{stat.label}</span>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a" }}>
                    {stat.value.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ border: "1px solid #EFEFEF", borderRadius: "6px", padding: "1.25rem" }}>
              <p style={{ fontSize: "0.8125rem", color: "#888", marginBottom: "0.875rem", lineHeight: 1.6 }}>
                Start a conversation with {name.split(" ")[0]} about your shared interests.
              </p>
              <button
                onClick={handleMessage}
                className="w-full transition-opacity hover:opacity-80"
                style={{ fontSize: "0.8125rem", fontWeight: 500, padding: "0.625rem", backgroundColor: "#0a0a0a", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Send a message
              </button>
            </div>
          </div>
        </div>



        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ borderTop: "1px solid #F0F0F0", marginTop: "4rem", paddingTop: "3rem", paddingBottom: "6rem" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              You might also like
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {suggestions.map((p) => (
                <ProfileCard key={p.id} profile={p} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </div>
      {followModal && (
        <FollowListModal
          userId={id}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}
