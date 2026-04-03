"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, X, Play, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string;
  created_at: string;
}

interface MediaGridProps {
  userId: string;
  isOwner: boolean;
}

export function MediaGrid({ userId, isOwner }: MediaGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video">("image");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setPosts(data as Post[]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setSelectedFile(file);
    setPreviewType(isVideo ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
    setShowUploadForm(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const ext = selectedFile.name.split(".").pop();
    const isVideo = selectedFile.type.startsWith("video/");
    const path = `${userId}/posts/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(path, selectedFile, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError);
      alert("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: userId,
      media_url: urlData.publicUrl,
      media_type: isVideo ? "video" : "image",
      caption: caption.trim(),
    });

    if (insertError) {
      console.error("Insert failed:", insertError);
      alert("Failed to save post.");
    } else {
      await fetchPosts();
      resetUploadForm();
    }

    setUploading(false);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;

    await supabase.from("posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPost(null);
  };

  const resetUploadForm = () => {
    setShowUploadForm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ borderTop: "1px solid #F0F0F0", marginTop: "3rem", paddingTop: "2.5rem" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#bbb",
            textTransform: "uppercase",
          }}
        >
          Gallery
        </p>
        {isOwner && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#888",
              background: "none",
              border: "1px dashed #D8D8D8",
              borderRadius: "3px",
              padding: "0.4rem 0.875rem",
              cursor: "pointer",
            }}
          >
            <Plus size={13} /> Add media
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Upload form */}
      {showUploadForm && (
        <div
          style={{
            marginBottom: "1.5rem",
            border: "1px solid #EFEFEF",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div style={{ position: "relative" }}>
            {previewType === "video" ? (
              <video
                src={previewUrl || ""}
                controls
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  backgroundColor: "#000",
                }}
              />
            ) : (
              <img
                src={previewUrl || ""}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  backgroundColor: "#000",
                }}
              />
            )}
          </div>
          <div style={{ padding: "1rem 1.25rem" }}>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)…"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "0.875rem",
                color: "#0a0a0a",
                backgroundColor: "transparent",
                marginBottom: "0.875rem",
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={resetUploadForm}
                disabled={uploading}
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  padding: "0.5rem 1rem",
                  backgroundColor: "transparent",
                  color: "#888",
                  border: "1px solid #D8D8D8",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-1.5"
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0a0a0a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus size={13} /> Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>Loading…</p>
        </div>
      ) : posts.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            border: "1px dashed #E8E8E8",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "#ccc", marginBottom: "0.25rem" }}>
            {isOwner ? "Your gallery is empty." : "No posts yet."}
          </p>
          {isOwner && (
            <p style={{ fontSize: "0.75rem", color: "#ddd" }}>
              Upload photos and videos to showcase your work and interests.
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "4px",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              style={{
                position: "relative",
                paddingBottom: "100%",
                backgroundColor: "#F0F0F0",
                border: "none",
                cursor: "pointer",
                overflow: "hidden",
                padding: 0,
              }}
            >
              {post.media_type === "video" ? (
                <>
                  <video
                    src={post.media_url}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    muted
                    playsInline
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={12} color="#fff" fill="#fff" />
                  </div>
                </>
              ) : (
                <img
                  src={post.media_url}
                  alt={post.caption || ""}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "2rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 20px 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* Media */}
            <div style={{ backgroundColor: "#000", position: "relative" }}>
              {selectedPost.media_type === "video" ? (
                <video
                  src={selectedPost.media_url}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              ) : (
                <img
                  src={selectedPost.media_url}
                  alt={selectedPost.caption || ""}
                  style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              )}
              <button
                onClick={() => setSelectedPost(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Caption + actions */}
            <div className="flex items-center justify-between" style={{ padding: "1rem 1.25rem" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {selectedPost.caption && (
                  <p style={{ fontSize: "0.875rem", color: "#333", marginBottom: "0.25rem" }}>
                    {selectedPost.caption}
                  </p>
                )}
                <p style={{ fontSize: "0.6875rem", color: "#ccc" }}>
                  {new Date(selectedPost.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(selectedPost.id)}
                  className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "#e55",
                    background: "none",
                    border: "1px solid #fcc",
                    borderRadius: "3px",
                    padding: "0.4rem 0.75rem",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
