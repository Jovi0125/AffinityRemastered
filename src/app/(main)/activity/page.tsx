"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageCircle, Star, AtSign, Handshake, Check, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";
import { useConnections } from "@/hooks/useConnections";

interface ActivityItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: "follow" | "new_user" | "message" | "profile_update" | "connection_request" | "connection_accepted";
  reference_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: { full_name: string | null; avatar_url: string | null };
}

interface ConnectionRequest {
  id: string;
  sender_id: string;
  created_at: string;
  sender?: { full_name: string | null; avatar_url: string | null; bio: string | null; interests: string[] | null };
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  follow:               { icon: UserPlus,     label: "started following you",           color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  message:              { icon: MessageCircle, label: "sent you a message",              color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  new_user:             { icon: Star,          label: "joined Affinity",                 color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  profile_update:       { icon: AtSign,        label: "updated their profile",           color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  connection_request:   { icon: Handshake,     label: "sent you a connection request",   color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  connection_accepted:  { icon: Check,         label: "accepted your connection request", color: "#059669", bg: "rgba(5,150,105,0.08)" },
};

export default function ActivityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const supabase = createClient();
  const { acceptConnect, declineConnect } = useConnections();

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [authLoading, user, router]);

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("connections")
      .select("id, sender_id, created_at")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const senderIds = data.map((r: ConnectionRequest) => r.sender_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, interests")
        .in("id", senderIds);
      const map = new Map((profiles || []).map((p: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null; interests: string[] | null }) => [p.id, p]));
      setRequests(data.map((r: ConnectionRequest) => ({ ...r, sender: map.get(r.sender_id) })));
    } else {
      setRequests([]);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      const { data } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        const actorIds = [...new Set(data.map((a: ActivityItem) => a.actor_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", actorIds);
        const profileMap = new Map(
          (profiles || []).map((p: { id: string; full_name: string | null; avatar_url: string | null }) => [p.id, p])
        );
        setActivities(data.map((a: ActivityItem) => ({ ...a, actor: profileMap.get(a.actor_id) || { full_name: null, avatar_url: null } })));
      }
      setLoading(false);
    };

    fetchActivity();
    fetchRequests();

    const channel = supabase
      .channel("activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_feed", filter: `user_id=eq.${user.id}` }, () => fetchActivity())
      .subscribe();

    const reqChannel = supabase
      .channel("connections-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "connections", filter: `receiver_id=eq.${user.id}` }, () => fetchRequests())
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(reqChannel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAccept = async (req: ConnectionRequest) => {
    if (!user) return;
    setActionLoading(req.id);
    await acceptConnect(req.id, req.sender_id, user.id);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActionLoading(null);
  };

  const handleDecline = async (req: ConnectionRequest) => {
    setActionLoading(req.id);
    await declineConnect(req.id);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActionLoading(null);
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitials = (name: string | null) =>
    (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const handleActivityClick = (item: ActivityItem) => {
    if (["follow", "new_user", "profile_update", "connection_request", "connection_accepted"].includes(item.type)) {
      router.push(`/profile/${item.actor_id}`);
    } else if (item.type === "message") {
      router.push(`/messages?c=${item.reference_id}`);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#aaa" }}>Loading…</p>
      </div>
    );
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const groups: { label: string; items: ActivityItem[] }[] = [];
  const todayItems = activities.filter(a => new Date(a.created_at).toDateString() === today.toDateString());
  const yesterdayItems = activities.filter(a => new Date(a.created_at).toDateString() === yesterday.toDateString());
  const olderItems = activities.filter(a =>
    new Date(a.created_at).toDateString() !== today.toDateString() &&
    new Date(a.created_at).toDateString() !== yesterday.toDateString()
  );
  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems });

  return (
    <PageTransition>
      <div style={{ backgroundColor: "#fff", minHeight: "100vh", paddingTop: "4rem" }}>
        <section style={{ padding: "6rem 0 4rem", borderBottom: "1px solid #EFEFEF" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
              Activity
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2.25rem, 4vw, 3rem)", fontWeight: 500, color: "#0a0a0a", lineHeight: 1.12, letterSpacing: "-0.02em" }}>
              What&apos;s happening.
            </h1>
          </div>
        </section>

        <section style={{ padding: "2rem 0 8rem" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-8">

            {/* ─── Connection Requests ─── */}
            {requests.length > 0 && (
              <div style={{ marginBottom: "2.5rem" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#7c3aed", textTransform: "uppercase", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #ede9fe" }}>
                  Connection Requests · {requests.length}
                </p>
                <div className="flex flex-col gap-3">
                  {requests.map(req => {
                    const name = req.sender?.full_name || "Someone";
                    const busy = actionLoading === req.id;
                    return (
                      <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.25rem", borderRadius: 16, border: "1.5px solid #ede9fe", backgroundColor: "#faf9ff" }}>
                        {/* Avatar */}
                        <button onClick={() => router.push(`/profile/${req.sender_id}`)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
                          {req.sender?.avatar_url ? (
                            <img src={req.sender.avatar_url} alt={name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#7c3aed" }}>
                              {getInitials(req.sender?.full_name || null)}
                            </div>
                          )}
                        </button>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#1a1a2e", marginBottom: "0.125rem" }}>{name}</p>
                          {req.sender?.bio && (
                            <p style={{ fontSize: "0.75rem", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {req.sender.bio}
                            </p>
                          )}
                          <p style={{ fontSize: "0.6875rem", color: "#bbb", marginTop: "0.125rem" }}>{formatTime(req.created_at)}</p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <button
                            disabled={busy}
                            onClick={() => handleAccept(req)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0.5rem 1rem", borderRadius: 20, fontSize: "0.8125rem", fontWeight: 600, border: "none", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", transition: "opacity 0.15s" }}
                          >
                            <Check size={14} />
                            Accept
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => handleDecline(req)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0.5rem 1rem", borderRadius: 20, fontSize: "0.8125rem", fontWeight: 600, border: "1.5px solid #e5e5f0", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, background: "#fff", color: "#888", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e5f0"; e.currentTarget.style.color = "#888"; }}
                          >
                            <X size={14} />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Activity Feed ─── */}
            {loading ? (
              <div style={{ padding: "4rem 0", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#ccc" }}>Loading activity…</p>
              </div>
            ) : activities.length === 0 && requests.length === 0 ? (
              <div style={{ padding: "4rem 0", textAlign: "center" }}>
                <p className="font-display" style={{ fontSize: "1.5rem", color: "#ddd", fontStyle: "italic", marginBottom: "0.5rem" }}>
                  No activity yet.
                </p>
                <p style={{ fontSize: "0.875rem", color: "#ccc" }}>
                  When people follow you or send messages, it&apos;ll show up here.
                </p>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.label} style={{ marginBottom: "2rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #F5F5F5" }}>
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.items.map(item => {
                      const config = typeConfig[item.type] || typeConfig.follow;
                      const Icon = config.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleActivityClick(item)}
                          className="flex items-center gap-4 w-full text-left transition-colors hover:bg-gray-50"
                          style={{ padding: "1rem 1.125rem", borderRadius: "10px", background: "none", border: "none", cursor: "pointer" }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: config.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon size={16} color={config.color} />
                          </div>
                          {item.actor?.avatar_url ? (
                            <img src={item.actor.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#555", flexShrink: 0 }}>
                              {getInitials(item.actor?.full_name || null)}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.875rem", color: "#0a0a0a", lineHeight: 1.4 }}>
                              <span style={{ fontWeight: 500 }}>{item.actor?.full_name || "Someone"}</span>{" "}
                              <span style={{ color: "#666" }}>{config.label}</span>
                            </p>
                          </div>
                          <span style={{ fontSize: "0.6875rem", color: "#ccc", flexShrink: 0 }}>{formatTime(item.created_at)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
