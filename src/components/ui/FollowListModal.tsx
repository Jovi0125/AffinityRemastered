"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface UserEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string;
}

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}

export function FollowListModal({ userId, type, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      if (type === "followers") {
        // Get users who follow this userId
        const { data: follows } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);

        if (follows && follows.length > 0) {
          const ids = follows.map((f) => f.follower_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, bio")
            .in("id", ids);
          if (profiles) setUsers(profiles as UserEntry[]);
        }
      } else {
        // Get users this userId follows
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        if (follows && follows.length > 0) {
          const ids = follows.map((f) => f.following_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, bio")
            .in("id", ids);
          if (profiles) setUsers(profiles as UserEntry[]);
        }
      }
      setLoading(false);
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, type]);

  const getInitials = (name: string | null) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: 400,
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 16px 64px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "1.125rem 1.25rem", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}
        >
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#0a0a0a" }}>
            {type === "followers" ? "Followers" : "Following"}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>Loading…</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "#ccc" }}>
                {type === "followers" ? "No followers yet." : "Not following anyone yet."}
              </p>
            </div>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                onClick={onClose}
                className="flex items-center gap-3 transition-colors"
                style={{
                  padding: "0.875rem 1.25rem",
                  textDecoration: "none",
                  borderBottom: "1px solid #FAFAFA",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt={u.full_name || ""}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#F0F0F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#555",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(u.full_name)}
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a", marginBottom: "0.1rem" }}>
                    {u.full_name || "Anonymous"}
                  </p>
                  {u.bio && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#999",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {u.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
