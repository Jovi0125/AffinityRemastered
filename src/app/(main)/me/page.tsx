"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Edit3, Check, X, Plus, Camera, ImagePlus, Share2, ChevronDown, Trash2, Clock, Send } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/providers/ThemeProvider";
import { InterestTag } from "@/components/ui/InterestTag";
import { FollowListModal } from "@/components/ui/FollowListModal";
import { PageTransition } from "@/components/ui/PageTransition";

import { allInterests, availabilityOptions } from "@/data/profiles";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina",
  "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
  "Costa Rica", "Croatia", "Cuba", "Czech Republic", "Denmark", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Ethiopia", "Finland", "France", "Georgia", "Germany",
  "Ghana", "Greece", "Guatemala", "Honduras", "Hong Kong", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kuwait", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Malaysia",
  "Mexico", "Moldova", "Mongolia", "Morocco", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan",
  "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia", "Singapore",
  "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Tunisia",
  "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zimbabwe",
];

export default function MyProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editAvailability, setEditAvailability] = useState("");
  const [showInterestPicker, setShowInterestPicker] = useState(false);

  // Image upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);
  const [posts, setPosts] = useState<{id:string;content:string;created_at:string}[]>([]);
  const [postContent, setPostContent] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [posting, setPosting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
      setEditInterests(profile.interests || []);
      setEditAvailability(profile.availability || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);
      setFollowerCount(followers ?? 0);
      setFollowingCount(following ?? 0);
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch posts
  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      const { data, count } = await supabase
        .from("posts")
        .select("id, content, created_at", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
      setPostCount(count ?? 0);
    };
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePost = async () => {
    if (!user || !postContent.trim() || posting) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content: postContent.trim() })
      .select("id, content, created_at")
      .single();
    if (error) {
      console.error("Post error:", error);
      alert("Failed to post: " + error.message);
    }
    if (data) {
      setPosts(prev => [data, ...prev]);
      setPostCount(c => c + 1);
      setPostContent("");
    }
    setPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setPostCount(c => Math.max(0, c - 1));
  };

  const formatPostTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const da = Math.floor(hr / 24);
    if (da < 7) return `${da}d`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${path}.${ext}`;

    const { error } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setUploading(true);

    let newAvatarUrl = profile?.avatar_url || "";
    let newCoverUrl = profile?.cover_url || "";

    if (avatarFile) {
      const url = await uploadFile(avatarFile, `${user.id}/avatar`);
      if (url) newAvatarUrl = `${url}?t=${Date.now()}`;
    }

    if (coverFile) {
      const url = await uploadFile(coverFile, `${user.id}/cover`);
      if (url) newCoverUrl = `${url}?t=${Date.now()}`;
    }

    setUploading(false);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: editName,
        bio: editBio,
        location: editLocation,
        interests: editInterests,
        availability: editAvailability,
        avatar_url: newAvatarUrl,
        cover_url: newCoverUrl,
      });

    if (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save. Please try again.");
    } else {
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setShowInterestPicker(false);
    setAvatarFile(null);
    setCoverFile(null);
    setAvatarPreview(null);
    setCoverPreview(null);
    if (profile) {
      setEditName(profile.full_name || "");
      setEditBio(profile.bio || "");
      setEditLocation(profile.location || "");
      setEditInterests(profile.interests || []);
      setEditAvailability(profile.availability || "");
    }
  };

  const toggleInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Loading…</p>
      </div>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentAvatar = avatarPreview || profile?.avatar_url;
  const currentCover = coverPreview || profile?.cover_url;

  return (
    <PageTransition>
    <div style={{ backgroundColor: d ? "#000" : "#faf9fd", minHeight: "100vh", paddingTop: "4rem" }}>
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: "none" }} />
      <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} style={{ display: "none" }} />

      {/* Cover */}
      <div
        style={{
          height: 280,
          backgroundColor: "#1a1a2e",
          position: "relative",
          overflow: "hidden",
          cursor: editing ? "pointer" : "default",
        }}
        onClick={() => editing && coverInputRef.current?.click()}
      >
        {currentCover ? (
          <img src={currentCover} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7)" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e 0%, #312e81 50%, #1a1a2e 100%)" }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
          background: "linear-gradient(to top, rgba(26,26,46,0.9) 0%, transparent 100%)",
        }} />

        {editing && (
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              backgroundColor: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.8)",
              fontSize: "0.8125rem", fontWeight: 500,
            }}
          >
            <ImagePlus size={18} />
            <span>Change cover</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Avatar + Actions row — sits in the cover overlap zone */}
        <div
          className="flex flex-row items-end justify-between"
          style={{ marginTop: "-60px", marginBottom: "0.875rem", position: "relative", zIndex: 10 }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={displayName}
                style={{
                  width: 110, height: 110, borderRadius: "50%", objectFit: "cover",
                  border: "4px solid #faf9fd",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  cursor: editing ? "pointer" : "default",
                }}
                onClick={() => editing && avatarInputRef.current?.click()}
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
                  cursor: editing ? "pointer" : "default",
                }}
                onClick={() => editing && avatarInputRef.current?.click()}
              >
                {initials}
              </div>
            )}

            {editing && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: "#fff", border: "2px solid #faf9fd",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Camera size={14} />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                  style={{
                    fontSize: "0.8125rem", fontWeight: 600, padding: "0.6rem 1.25rem",
                    backgroundColor: d ? "#16181c" : "#fff", color: d ? "#e7e9ea" : "#1a1a2e",
                    border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", cursor: "pointer",
                  }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
                <button
                  className="flex items-center justify-center transition-all duration-200 hover:shadow-md"
                  style={{
                    width: 38, height: 38, borderRadius: "12px",
                    backgroundColor: d ? "#16181c" : "#fff", border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                    cursor: "pointer", color: d ? "#71767b" : "#555",
                  }}
                >
                  <Share2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleCancel} className="flex items-center gap-2 transition-all hover:shadow-md"
                  style={{ fontSize: "0.8125rem", fontWeight: 600, padding: "0.6rem 1.25rem", backgroundColor: d ? "#16181c" : "#fff", color: d ? "#71767b" : "#888", border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`, borderRadius: "12px", cursor: "pointer" }}>
                  <X size={13} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 transition-all hover:shadow-lg"
                  style={{
                    fontSize: "0.8125rem", fontWeight: 600, padding: "0.6rem 1.25rem",
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                    color: "#fff", border: "none", borderRadius: "12px",
                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
                  }}>
                  <Check size={13} /> {saving ? (uploading ? "Uploading…" : "Saving…") : "Save"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name + Location — fully in the white content area */}
        <div style={{ marginBottom: "1.5rem" }}>
          {editing ? (
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name"
              className="font-sans"
              style={{
                fontSize: "1.75rem", fontWeight: 700, color: d ? "#e7e9ea" : "#1a1a2e",
                letterSpacing: "-0.03em", width: "100%",
                border: "none", borderBottom: `2px solid ${d ? "rgba(255,255,255,0.1)" : "#ede9fe"}`,
                outline: "none", padding: "0.15rem 0", backgroundColor: "transparent",
              }}
            />
          ) : (
            <h1
              className="font-sans"
              style={{ fontSize: "1.75rem", fontWeight: 700, color: d ? "#e7e9ea" : "#1a1a2e", letterSpacing: "-0.03em" }}
            >
              {displayName}
            </h1>
          )}
          <div className="flex items-center gap-1.5" style={{ marginTop: "0.25rem" }}>
            <MapPin size={12} color="#7c3aed" />
            {editing ? (
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  style={{
                    fontSize: "0.8125rem", color: editLocation ? "#7c3aed" : "#a1a1aa",
                    border: "none", borderBottom: "1px solid #ede9fe",
                    outline: "none", padding: "0.1rem 1.25rem 0.1rem 0",
                    backgroundColor: "transparent", cursor: "pointer",
                    appearance: "none", WebkitAppearance: "none",
                    minWidth: 160,
                  }}
                >
                  <option value="">Select your country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={12} color="#7c3aed" style={{ position: "absolute", right: 0, pointerEvents: "none" }} />
              </div>
            ) : (
              <span style={{ fontSize: "0.8125rem", color: "#7c3aed" }}>
                {profile?.location || "Add your location"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8 mb-6" style={{ paddingTop: "0.5rem" }}>
          <button onClick={() => setFollowModal("followers")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: d ? "#e7e9ea" : "#1a1a2e" }}>{formatCount(followerCount)}</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: d ? "#71767b" : "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Followers</p>
          </button>
          <button onClick={() => setFollowModal("following")} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: d ? "#e7e9ea" : "#1a1a2e" }}>{formatCount(followingCount)}</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: d ? "#71767b" : "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Following</p>
          </button>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: d ? "#e7e9ea" : "#1a1a2e" }}>{postCount}</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: d ? "#71767b" : "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Posts</p>
          </div>
        </div>

        {/* ── Compact profile info (Twitter-style) ── */}
        <div style={{ maxWidth: 600, paddingBottom: "1rem" }}>
          {/* Bio */}
          {editing ? (
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell people about yourself…" rows={3}
              style={{
                fontSize: "0.9375rem", color: d ? "#e7e9ea" : "#555", lineHeight: 1.7, width: "100%",
                border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "#ede9fe"}`, borderRadius: "12px", padding: "0.75rem",
                outline: "none", resize: "vertical", backgroundColor: d ? "#16181c" : "#f5f3ff",
                fontFamily: "inherit", marginBottom: "0.75rem",
              }}
            />
          ) : (
            <p style={{ fontSize: "0.9375rem", color: d ? "#e7e9ea" : "#555", lineHeight: 1.7, marginBottom: "0.5rem" }}>
              {profile?.bio || "Add a bio to tell people about yourself."}
            </p>
          )}

          {/* Meta line: availability · email · joined */}
          {!editing && (
            <p style={{ fontSize: "0.8125rem", color: d ? "#71767b" : "#a1a1aa", marginBottom: "0.75rem" }}>
              {profile?.availability && <><Clock size={11} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />{profile.availability} · </>}
              {user.email} · Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          )}

          {/* Editing: availability radios */}
          {editing && (
            <div style={{ marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: d ? "#71767b" : "#a1a1aa", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Availability</p>
              <div className="flex items-center gap-3 flex-wrap">
                {availabilityOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: "0.8125rem", color: d ? "#e7e9ea" : "#555" }}>
                    <input type="radio" name="availability" checked={editAvailability === opt}
                      onChange={() => setEditAvailability(opt)} style={{ accentColor: "#7c3aed" }} />
                    {opt}
                  </label>
                ))}
                {editAvailability && (
                  <button onClick={() => setEditAvailability("")} style={{ fontSize: "0.75rem", color: "#a1a1aa", background: "none", border: "none", cursor: "pointer" }}>Clear</button>
                )}
              </div>
            </div>
          )}

          {/* Interests */}
          <div className="flex flex-wrap gap-2" style={{ marginBottom: "0.25rem" }}>
            {editing ? (
              <>
                {editInterests.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                    <InterestTag label={interest} filled size="md" />
                  </button>
                ))}
                <button onClick={() => setShowInterestPicker((v) => !v)} className="flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ fontSize: "0.75rem", color: "#7c3aed", border: "1px dashed #c4b5fd", borderRadius: "20px", padding: "0.25rem 0.75rem", background: "none", cursor: "pointer", fontWeight: 500 }}>
                  <Plus size={12} /> Add
                </button>
              </>
            ) : (
              (profile?.interests?.length ?? 0) > 0 ? (
                profile?.interests.map((interest) => (
                  <InterestTag key={interest} label={interest} size="md" />
                ))
              ) : null
            )}
          </div>
          {editing && showInterestPicker && (
            <div className="mt-2 p-3 flex flex-wrap gap-2"
              style={{ border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "#ede9fe"}`, borderRadius: "14px", backgroundColor: d ? "#16181c" : "#f5f3ff", maxHeight: 180, overflowY: "auto" }}>
              {allInterests.filter((i) => !editInterests.includes(i)).map((interest) => (
                <button key={interest} onClick={() => toggleInterest(interest)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <InterestTag label={interest} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ borderBottom: `1px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, marginBottom: "1rem" }} />

        {/* ── Post Composer ── */}
        <div style={{ maxWidth: 600, paddingBottom: "1rem" }}>
          <div style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "1rem", borderRadius: 16,
            backgroundColor: d ? "#16181c" : "#fff",
            border: `1px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          }}>
            {currentAvatar ? (
              <img src={currentAvatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
            )}
            <div style={{ flex: 1 }}>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value.slice(0, 500))}
                placeholder="What's on your mind?"
                rows={2}
                style={{
                  width: "100%", fontSize: "0.9375rem", color: d ? "#e7e9ea" : "#1a1a2e",
                  backgroundColor: "transparent", border: "none", outline: "none",
                  resize: "none", fontFamily: "inherit", lineHeight: 1.5,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: "0.6875rem", color: postContent.length > 450 ? "#f4212e" : d ? "#71767b" : "#a1a1aa" }}>
                  {postContent.length}/500
                </span>
                <button
                  onClick={handlePost}
                  disabled={!postContent.trim() || posting}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: 20,
                    background: postContent.trim() ? "var(--gradient-purple)" : d ? "#333" : "#e5e5e5",
                    color: postContent.trim() ? "#fff" : d ? "#555" : "#aaa",
                    fontSize: "0.8125rem", fontWeight: 600, border: "none",
                    cursor: postContent.trim() ? "pointer" : "not-allowed",
                    opacity: posting ? 0.6 : 1,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <Send size={13} /> Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Posts Feed ── */}
        <div style={{ maxWidth: 600, paddingBottom: "3rem" }}>
          {posts.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: d ? "#71767b" : "#ccc", textAlign: "center", padding: "2rem 0" }}>
              No posts yet. Share your first thought!
            </p>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={{
                padding: "1rem 0",
                borderBottom: `1px solid ${d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: d ? "#e7e9ea" : "#1a1a2e" }}>{displayName}</span>
                      <span style={{ fontSize: "0.75rem", color: d ? "#71767b" : "#a1a1aa" }}>· {formatPostTime(post.created_at)}</span>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete post"
                        className="transition-opacity hover:opacity-70"
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: d ? "#71767b" : "#ccc", padding: 2 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p style={{ fontSize: "0.9375rem", color: d ? "#e7e9ea" : "#333", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {followModal && user && (
        <FollowListModal
          userId={user.id}
          type={followModal}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
    </PageTransition>
  );
}
