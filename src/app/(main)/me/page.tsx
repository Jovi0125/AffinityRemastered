"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Edit3, Check, X, Plus, Camera, ImagePlus, Share2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { InterestTag } from "@/components/ui/InterestTag";
import { FollowListModal } from "@/components/ui/FollowListModal";
import { PageTransition } from "@/components/ui/PageTransition";

import { allInterests, availabilityOptions } from "@/data/profiles";

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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
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
    <div style={{ backgroundColor: "#faf9fd", minHeight: "100vh", paddingTop: "4rem" }}>
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
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          style={{ marginTop: "-60px", marginBottom: "1.5rem", position: "relative", zIndex: 10 }}
        >
          <div className="flex items-end gap-4">
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

            {/* Name + location */}
            <div style={{ marginBottom: "0.5rem" }}>
              {editing ? (
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name"
                  className="font-display"
                  style={{
                    fontSize: "1.75rem", fontWeight: 700, color: "#fff",
                    letterSpacing: "-0.01em", width: "100%",
                    border: "none", borderBottom: "2px solid rgba(255,255,255,0.3)",
                    outline: "none", padding: "0.15rem 0", backgroundColor: "transparent",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                />
              ) : (
                <h1
                  className="font-display"
                  style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                >
                  {displayName}
                </h1>
              )}
              <div className="flex items-center gap-1.5">
                <MapPin size={12} color="#c4b5fd" />
                {editing ? (
                  <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Your location"
                    style={{ fontSize: "0.8125rem", color: "#c4b5fd", border: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", outline: "none", padding: "0.1rem 0", backgroundColor: "transparent" }}
                  />
                ) : (
                  <span style={{ fontSize: "0.8125rem", color: "#c4b5fd" }}>
                    {profile?.location || "Add your location"}
                  </span>
                )}
              </div>
            </div>
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
                    backgroundColor: "#fff", color: "#1a1a2e",
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", cursor: "pointer",
                  }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
                <button
                  className="flex items-center justify-center transition-all duration-200 hover:shadow-md"
                  style={{
                    width: 38, height: 38, borderRadius: "12px",
                    backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.08)",
                    cursor: "pointer", color: "#555",
                  }}
                >
                  <Share2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleCancel} className="flex items-center gap-2 transition-all hover:shadow-md"
                  style={{ fontSize: "0.8125rem", fontWeight: 600, padding: "0.6rem 1.25rem", backgroundColor: "#fff", color: "#888", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", cursor: "pointer" }}>
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
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a2e" }}>0</p>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Journals</p>
          </div>
        </div>

        {/* Profile details */}
        <div className="flex flex-col gap-5" style={{ maxWidth: 600, paddingBottom: "3rem" }}>

            {/* About card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                About
              </p>
              {editing ? (
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell people about yourself…" rows={4}
                  style={{
                    fontSize: "0.9375rem", color: "#555", lineHeight: 1.7, width: "100%",
                    border: "1px solid #ede9fe", borderRadius: "12px", padding: "0.75rem",
                    outline: "none", resize: "vertical", backgroundColor: "#f5f3ff",
                    fontFamily: "inherit",
                  }}
                />
              ) : (
                <p style={{ fontSize: "0.9375rem", color: "#555", lineHeight: 1.7 }}>
                  {profile?.bio || "Add a bio to tell people about yourself."}
                </p>
              )}
            </div>

            {/* Interests card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Curated Interests
              </p>
              <div className="flex flex-wrap gap-2">
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
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "#ccc", fontStyle: "italic" }}>
                      No interests added yet.
                    </p>
                  )
                )}
              </div>
              {editing && showInterestPicker && (
                <div className="mt-3 p-4 flex flex-wrap gap-2"
                  style={{ border: "1px solid #ede9fe", borderRadius: "14px", backgroundColor: "#f5f3ff", maxHeight: 200, overflowY: "auto" }}>
                  {allInterests.filter((i) => !editInterests.includes(i)).map((interest) => (
                    <button key={interest} onClick={() => toggleInterest(interest)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                      <InterestTag label={interest} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Availability
              </p>
              {editing ? (
                <div className="flex flex-col gap-2">
                  {availabilityOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.8125rem", color: "#555" }}>
                      <input
                        type="radio" name="availability"
                        checked={editAvailability === opt}
                        onChange={() => setEditAvailability(opt)}
                        style={{ accentColor: "#7c3aed" }}
                      />
                      {opt}
                    </label>
                  ))}
                  {editAvailability && (
                    <button onClick={() => setEditAvailability("")} style={{ fontSize: "0.75rem", color: "#a1a1aa", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, marginTop: "0.25rem" }}>
                      Clear selection
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: "0.8125rem", color: profile?.availability ? "#555" : "#ccc", fontStyle: profile?.availability ? "normal" : "italic" }}>
                  {profile?.availability || "Not set"}
                </p>
              )}
            </div>

            {/* Account */}
            <div style={{ backgroundColor: "#fff", borderRadius: "20px", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Account
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#888", marginBottom: "0.25rem" }}>{user.email}</p>
              <p style={{ fontSize: "0.75rem", color: "#ccc" }}>
                Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
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
