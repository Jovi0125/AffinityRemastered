"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, MessageCircle, UserPlus, Heart, MessageSquare, Share2 } from "lucide-react";
import { profiles } from "@/data/profiles";
import { InterestTag } from "@/components/ui/InterestTag";
import { ProfileCard } from "@/components/ui/ProfileCard";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const profile = profiles.find((p) => p.id === id) ?? profiles[0];
  const [following, setFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const suggestions = profiles.filter((p) => p.id !== profile.id).slice(0, 3);
  const profileIndex = profiles.indexOf(profile);
  const connectionCount = [347, 512, 289, 634, 178, 421][profileIndex % 6];
  const followingCount  = [112,  87, 203, 156,  64,  98][profileIndex % 6];

  const toggleLike = (postId: string) =>
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Cover */}
      <div style={{ height: 320, backgroundColor: "#111", position: "relative", overflow: "hidden" }}>
        {profile.coverImage ? (
          <Image src={profile.coverImage} alt="cover" fill
            style={{ objectFit: "cover", filter: "grayscale(100%) brightness(0.5)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(135deg, #111 0%, #333 50%, #111 100%)" }} />
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
        {/* Avatar + actions */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          style={{ marginTop: "-52px", marginBottom: "2.5rem" }}
        >
          <Image
            src={profile.avatar} alt={profile.name} width={104} height={104}
            style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)", border: "4px solid #fff", boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/messages")}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.03em", padding: "0.6rem 1.25rem", backgroundColor: "transparent", color: "#0a0a0a", border: "1px solid #D8D8D8", borderRadius: "3px", cursor: "pointer" }}
            >
              <MessageCircle size={13} /> Message
            </button>
            <button
              onClick={() => setFollowing((v) => !v)}
              className="flex items-center gap-2 transition-all hover:opacity-80"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.03em", padding: "0.6rem 1.25rem",
                backgroundColor: following ? "transparent" : "#0a0a0a",
                color: following ? "#0a0a0a" : "#fff",
                border: "1px solid", borderColor: following ? "#D8D8D8" : "#0a0a0a",
                borderRadius: "3px", cursor: "pointer",
              }}
            >
              <UserPlus size={13} /> {following ? "Following" : "Follow"}
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
              {profile.name}
            </h1>
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={13} color="#aaa" />
              <span style={{ fontSize: "0.8125rem", color: "#aaa" }}>{profile.location}</span>
              {profile.mutuals !== undefined && (
                <>
                  <span style={{ color: "#ddd" }}>·</span>
                  <span style={{ fontSize: "0.8125rem", color: "#aaa" }}>{profile.mutuals} mutual connections</span>
                </>
              )}
            </div>
            <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75, maxWidth: 520, marginBottom: "1.75rem", fontWeight: 300 }}>
              {profile.bio}
            </p>

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
          </div>

          {/* Stats sidebar */}
          <div>
            <div style={{ border: "1px solid #EFEFEF", borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Posts",       value: profile.posts.length },
                { label: "Connections", value: connectionCount },
                { label: "Following",   value: followingCount },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center justify-between py-3"
                  style={{ borderTop: i > 0 ? "1px solid #F5F5F5" : "none" }}>
                  <span style={{ fontSize: "0.8125rem", color: "#999" }}>{stat.label}</span>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a" }}>
                    {stat.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid #EFEFEF", borderRadius: "6px", padding: "1.25rem" }}>
              <p style={{ fontSize: "0.8125rem", color: "#888", marginBottom: "0.875rem", lineHeight: 1.6 }}>
                Start a conversation with {profile.name.split(" ")[0]} about your shared interests.
              </p>
              <button
                onClick={() => router.push("/messages")}
                className="w-full transition-opacity hover:opacity-80"
                style={{ fontSize: "0.8125rem", fontWeight: 500, padding: "0.625rem", backgroundColor: "#0a0a0a", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
              >
                Send a message
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #F0F0F0", marginTop: "4rem", marginBottom: "3rem" }} />

        {/* Posts */}
        {profile.posts.length > 0 ? (
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "2rem" }}>
              Posts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {profile.posts.map((post) => (
                <div key={post.id} style={{ border: "1px solid #EFEFEF", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>
                    <Image
                      src={post.image} alt={post.caption} fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover", filter: "grayscale(100%)", transition: "transform 0.4s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "#333", lineHeight: 1.55, marginBottom: "0.875rem" }}>
                      {post.caption}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: likedPosts[post.id] ? "#0a0a0a" : "#aaa" }}
                        >
                          <Heart size={14} fill={likedPosts[post.id] ? "#0a0a0a" : "none"} />
                          <span style={{ fontSize: "0.75rem" }}>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                        </button>
                        <button className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#aaa" }}>
                          <MessageSquare size={14} />
                          <span style={{ fontSize: "0.75rem" }}>{post.comments}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: "0.6875rem", color: "#ccc" }}>{post.timestamp}</span>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 mb-16" style={{ borderTop: "1px solid #F8F8F8" }}>
            <p className="font-display" style={{ fontSize: "1.25rem", color: "#ddd", fontStyle: "italic" }}>
              No posts yet.
            </p>
          </div>
        )}

        {/* Suggestions */}
        <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "3rem", paddingBottom: "6rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            You might also like
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {suggestions.map((p) => (
              <ProfileCard key={p.id} profile={p} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
