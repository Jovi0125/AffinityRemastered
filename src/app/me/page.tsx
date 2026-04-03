"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Edit3, Check, X, Plus, Camera, ImagePlus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { InterestTag } from "@/components/ui/InterestTag";
import { allInterests } from "@/data/profiles";

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
  const [showInterestPicker, setShowInterestPicker] = useState(false);

  // Image upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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

    // Upload avatar if changed
    if (avatarFile) {
      const url = await uploadFile(avatarFile, `${user.id}/avatar`);
      if (url) newAvatarUrl = `${url}?t=${Date.now()}`;
    }

    // Upload cover if changed
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
    }
  };

  const toggleInterest = (interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#aaa" }}>Loading…</p>
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
    <div style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        style={{ display: "none" }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverSelect}
        style={{ display: "none" }}
      />

      {/* Cover */}
      <div
        style={{
          height: 280,
          backgroundColor: "#111",
          position: "relative",
          overflow: "hidden",
          cursor: editing ? "pointer" : "default",
        }}
        onClick={() => editing && coverInputRef.current?.click()}
      >
        {currentCover ? (
          <img
            src={currentCover}
            alt="Cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(80%) brightness(0.6)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
            }}
          />
        )}

        {/* Cover edit overlay */}
        {editing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              transition: "opacity 0.2s ease",
            }}
          >
            <ImagePlus size={18} />
            <span>Change cover</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
          style={{ marginTop: "-52px", marginBottom: "2.5rem", position: "relative", zIndex: 10 }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={displayName}
                style={{
                  width: 104, height: 104, borderRadius: "50%", objectFit: "cover",
                  border: "4px solid #fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                  cursor: editing ? "pointer" : "default",
                }}
                onClick={() => editing && avatarInputRef.current?.click()}
              />
            ) : (
              <div
                style={{
                  width: 104, height: 104, borderRadius: "50%", backgroundColor: "#F0F0F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2rem", fontWeight: 600, color: "#555",
                  border: "4px solid #fff", boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
                  cursor: editing ? "pointer" : "default",
                }}
                onClick={() => editing && avatarInputRef.current?.click()}
              >
                {initials}
              </div>
            )}

            {/* Avatar edit badge */}
            {editing && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#0a0a0a",
                  color: "#fff",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Camera size={13} />
              </button>
            )}
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{
                fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.03em",
                padding: "0.6rem 1.25rem", backgroundColor: "#0a0a0a", color: "#fff",
                border: "none", borderRadius: "3px", cursor: "pointer",
              }}
            >
              <Edit3 size={13} /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} className="flex items-center gap-2 transition-opacity hover:opacity-70"
                style={{ fontSize: "0.8125rem", fontWeight: 500, padding: "0.6rem 1.25rem", backgroundColor: "transparent", color: "#888", border: "1px solid #D8D8D8", borderRadius: "3px", cursor: "pointer" }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 transition-opacity hover:opacity-80"
                style={{ fontSize: "0.8125rem", fontWeight: 500, padding: "0.6rem 1.25rem", backgroundColor: "#0a0a0a", color: "#fff", border: "none", borderRadius: "3px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                <Check size={13} /> {saving ? (uploading ? "Uploading…" : "Saving…") : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {editing ? (
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" className="font-display"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.02em", marginBottom: "0.5rem", width: "100%", border: "none", borderBottom: "2px solid #E8E8E8", outline: "none", padding: "0.25rem 0", backgroundColor: "transparent" }} />
            ) : (
              <h1 className="font-display" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                {displayName}
              </h1>
            )}

            <div className="flex items-center gap-2 mb-5">
              <MapPin size={13} color="#aaa" />
              {editing ? (
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="Your location"
                  style={{ fontSize: "0.8125rem", color: "#555", border: "none", borderBottom: "1px solid #E8E8E8", outline: "none", padding: "0.15rem 0", backgroundColor: "transparent", width: 250 }} />
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#aaa" }}>
                  {profile?.location || "Add your location"}
                </span>
              )}
            </div>

            {editing ? (
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell people about yourself…" rows={3}
                style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75, maxWidth: 520, marginBottom: "1.75rem", fontWeight: 300, width: "100%", border: "1px solid #E8E8E8", borderRadius: "4px", padding: "0.75rem", outline: "none", resize: "vertical", backgroundColor: "#FAFAFA", fontFamily: "inherit" }} />
            ) : (
              <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.75, maxWidth: 520, marginBottom: "1.75rem", fontWeight: 300 }}>
                {profile?.bio || "Add a bio to tell people about yourself."}
              </p>
            )}

            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.875rem" }}>
                Interests
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
                      style={{ fontSize: "0.75rem", color: "#888", border: "1px dashed #D8D8D8", borderRadius: "3px", padding: "0.3rem 0.75rem", background: "none", cursor: "pointer" }}>
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
                  style={{ border: "1px solid #EFEFEF", borderRadius: "6px", backgroundColor: "#FAFAFA", maxHeight: 200, overflowY: "auto" }}>
                  {allInterests.filter((i) => !editInterests.includes(i)).map((interest) => (
                    <button key={interest} onClick={() => toggleInterest(interest)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                      <InterestTag label={interest} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ border: "1px solid #EFEFEF", borderRadius: "6px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Followers", value: followerCount },
                { label: "Following", value: followingCount },
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
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.625rem" }}>
                Account
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#888", marginBottom: "0.25rem" }}>{user.email}</p>
              <p style={{ fontSize: "0.75rem", color: "#ccc" }}>
                Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
        <div style={{ paddingBottom: "6rem" }} />
      </div>
    </div>
  );
}
