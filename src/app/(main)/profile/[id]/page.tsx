"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, MessageCircle, UserPlus, UserCheck, ShieldOff, Shield, Share2, Star } from "lucide-react";
import { InterestTag } from "@/components/ui/InterestTag";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { FollowListModal } from "@/components/ui/FollowListModal";
import { OnlineIndicator } from "@/components/ui/OnlineIndicator";
import { PageTransition } from "@/components/ui/PageTransition";

import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useBlocks } from "@/hooks/useBlocks";
import { useAffinityScore } from "@/hooks/useAffinityScore";
import type { SupabaseProfile } from "@/data/profiles";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile: myProfile } = useAuth();
  const { isBlocked, blockUser, unblockUser } = useBlocks();
  const [profile, setProfile] = useState<(SupabaseProfile & { last_seen_at?: string }) | null>(null);
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
        .select("id, full_name, avatar_url, cover_url, location, bio, interests, availability, last_seen_at")
        .eq("id", id)
        .single();

      if (data) {
        setProfile(data as SupabaseProfile & { last_seen_at?: string });
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
      router.push("/");
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
      router.push("/");
      return;
    }
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
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>{loading ? "Loading…" : "Profile not found."}</p>
      </div>
    );
  }

  const name = profile.full_name || "Anonymous";
  const blocked = isBlocked(id);

  const handleBlock = async () => {
    if (blocked) {
      await unblockUser(id);
    } else {
      if (confirm(`Block ${name}? They won't be able to message you or see your profile.`)) {
        await blockUser(id);
      }
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <PageTransition>
    <div style={{ backgroundColor: "#faf9fd", minHeight: "100vh", paddingTop: "4rem" }}>
      {/* Cover */}
      <div style={{ height: 280, backgroundColor: "#1a1a2e", position: "relative", overflow: "hidden" }}>
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #312e81 50%, #1a1a2e 100%)",
          }} />
        )}
        {/* Purple gradient at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
          background: "linear-gradient(to top, rgba(26,26,46,0.9) 0%, transparent 100%)",
        }} />
      </div>

      {/* Profile header */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Avatar + Actions row — sits in the cover overlap zone */}
        <div
          className="flex flex-row items-end justify-between"
          style={{ marginTop: "-60px", marginBottom: "0.875rem", position: "relative", zIndex: 10 }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                style={{
                  width: 110, height: 110, borderRadius: "50%", objectFit: "cover",
                  border: "4px solid #faf9fd",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 110, height: 110, borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2.5rem", fontWeight: 600, color: "#fff",
                  border: "4px solid #faf9fd",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleMessage}
              className="flex items-center gap-2 transition-all duration-200 hover:shadow-md"
              style={{
                fontSize: "0.8125rem", fontWeight: 600, padding: "0.6rem 1.25rem",
                backgroundColor: "#fff", color: "#1a1a2e",
                border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", cursor: "pointer",
              }}
            >
              <MessageCircle size={14} /> Message
            </button>
            <button
              onClick={() => {}}
              className="flex items-center justify-center transition-all duration-200 hover:shadow-md"
              style={{
                width: 38, height: 38, borderRadius: "12px",
                backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer", color: "#555",
              }}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Name + Location — fully in the white content area */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1
            className="font-display"
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.01em" }}
          >
            {name}
          </h1>
          <div className="flex items-center gap-1.5" style={{ marginTop: "0.25rem" }}>
            <MapPin size={12} color="#7c3aed" />
            <span style={{ fontSize: "0.8125rem", color: "#7c3aed" }}>{profile.location || "Unknown"}</span>
          </div>
        </div>


        {/* Stats row */}
        <div className="flex items-center gap-8 mb-8" style={{ paddingTop: "0.5rem" }}>
          <button onClick={() => setFollowModal("followers")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a2e" }}>{formatCount(followerCount)}</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Followers</p>
          </button>
          <button onClick={() => setFollowModal("following")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a2e" }}>{formatCount(followingCount)}</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Following</p>
          </button>

        </div>

        {/* Profile info */}
        <div style={{ paddingBottom: "3rem" }}>
          <div className="flex flex-col gap-5">
            {/* About card */}
            <div style={{
              backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}>
              <p style={{
                fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
                color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem",
              }}>
                About
              </p>
              <p style={{ fontSize: "0.9375rem", color: "#555", lineHeight: 1.7 }}>
                {profile.bio || "No bio yet."}
              </p>
            </div>

            {/* Interests card */}
            <div style={{
              backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}>
              <p style={{
                fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
                color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem",
              }}>
                Curated Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {(profile.interests || []).map((interest) => (
                  <InterestTag
                    key={interest}
                    label={interest}
                    size="md"
                    filled={myProfile?.interests?.includes(interest)}
                  />
                ))}
                {(profile.interests?.length ?? 0) === 0 && (
                  <p style={{ fontSize: "0.8125rem", color: "#ccc", fontStyle: "italic" }}>
                    No interests added yet.
                  </p>
                )}
              </div>
            </div>

            {/* Availability card */}
            {profile.availability && (
              <div style={{
                backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
              }}>
                <p style={{
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
                  color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem",
                }}>
                  Availability
                </p>
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e" }} />
                  <span style={{ fontSize: "0.875rem", color: "#555" }}>{profile.availability}</span>
                </div>
              </div>
            )}

            {/* Actions card */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md"
                style={{
                  fontSize: "0.8125rem", fontWeight: 600, padding: "0.7rem 1rem",
                  background: following ? "#fff" : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: following ? "#7c3aed" : "#fff",
                  border: following ? "1.5px solid #7c3aed" : "none",
                  borderRadius: "14px", cursor: followLoading ? "not-allowed" : "pointer",
                  opacity: followLoading ? 0.6 : 1,
                }}
              >
                {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
                {following ? "Following" : "Follow"}
              </button>
              <button
                onClick={handleMessage}
                className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-md"
                style={{
                  fontSize: "0.8125rem", fontWeight: 600, padding: "0.7rem 1rem",
                  backgroundColor: "#fff", color: "#1a1a2e",
                  border: "1.5px solid rgba(0,0,0,0.08)", borderRadius: "14px", cursor: "pointer",
                }}
              >
                <MessageCircle size={14} /> Message
              </button>
            </div>

            {/* Block button */}
            <button
              onClick={handleBlock}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{
                fontSize: "0.75rem", fontWeight: 500, padding: "0.5rem 0.875rem",
                backgroundColor: "transparent",
                color: blocked ? "#ef4444" : "#a1a1aa",
                border: "none", cursor: "pointer", alignSelf: "flex-start",
              }}
              title={blocked ? "Unblock user" : "Block user"}
            >
              {blocked ? <ShieldOff size={13} /> : <Shield size={13} />}
              {blocked ? "Unblock" : "Block User"}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "2.5rem", paddingBottom: "4rem" }}>
            <p style={{
              fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "#a1a1aa", textTransform: "uppercase", marginBottom: "1.25rem",
            }}>
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
    </PageTransition>
  );
}
