"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, MessageCircle, Star, AtSign } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";

interface ActivityItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: "follow" | "new_user" | "message" | "profile_update";
  reference_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const typeConfig = {
  follow: {
    icon: UserPlus,
    label: "started following you",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  message: {
    icon: MessageCircle,
    label: "sent you a message",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
  },
  new_user: {
    icon: Star,
    label: "joined Affinity",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  profile_update: {
    icon: AtSign,
    label: "updated their profile",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
};

export default function ActivityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

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
        // Fetch actor profiles
        const actorIds = [...new Set(data.map((a: ActivityItem) => a.actor_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", actorIds);

        const profileMap = new Map(
          (profiles || []).map((p: { id: string; full_name: string | null; avatar_url: string | null }) => [p.id, p])
        );

        setActivities(
          data.map((a: ActivityItem) => ({
            ...a,
            actor: profileMap.get(a.actor_id) || { full_name: null, avatar_url: null },
          }))
        );
      }
      setLoading(false);
    };

    fetchActivity();

    // Real-time subscription
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleActivityClick = (item: ActivityItem) => {
    if (item.type === "follow" || item.type === "new_user" || item.type === "profile_update") {
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

  // Group activities by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: ActivityItem[] }[] = [];
  const todayItems = activities.filter((a) => new Date(a.created_at).toDateString() === today.toDateString());
  const yesterdayItems = activities.filter((a) => new Date(a.created_at).toDateString() === yesterday.toDateString());
  const olderItems = activities.filter(
    (a) =>
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
            <h1
              className="font-display"
              style={{ fontSize: "clamp(2.25rem, 4vw, 3rem)", fontWeight: 500, color: "#0a0a0a", lineHeight: 1.12, letterSpacing: "-0.02em" }}
            >
              What&apos;s happening.
            </h1>
          </div>
        </section>

        <section style={{ padding: "2rem 0 8rem" }}>
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            {loading ? (
              <div style={{ padding: "4rem 0", textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", color: "#ccc" }}>Loading activity…</p>
              </div>
            ) : activities.length === 0 ? (
              <div style={{ padding: "4rem 0", textAlign: "center" }}>
                <p className="font-display" style={{ fontSize: "1.5rem", color: "#ddd", fontStyle: "italic", marginBottom: "0.5rem" }}>
                  No activity yet.
                </p>
                <p style={{ fontSize: "0.875rem", color: "#ccc" }}>
                  When people follow you or send messages, it&apos;ll show up here.
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} style={{ marginBottom: "2rem" }}>
                  <p style={{
                    fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
                    color: "#bbb", textTransform: "uppercase", marginBottom: "1rem",
                    paddingBottom: "0.5rem", borderBottom: "1px solid #F5F5F5",
                  }}>
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const config = typeConfig[item.type];
                      const Icon = config.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleActivityClick(item)}
                          className="flex items-center gap-4 w-full text-left transition-colors hover:bg-gray-50"
                          style={{
                            padding: "1rem 1.125rem",
                            borderRadius: "10px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {/* Icon */}
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: "50%",
                              backgroundColor: config.bg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={16} color={config.color} />
                          </div>

                          {/* Avatar */}
                          {item.actor?.avatar_url ? (
                            <img
                              src={item.actor.avatar_url}
                              alt=""
                              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F0F0F0",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.75rem", fontWeight: 600, color: "#555", flexShrink: 0,
                              }}
                            >
                              {getInitials(item.actor?.full_name || null)}
                            </div>
                          )}

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "0.875rem", color: "#0a0a0a", lineHeight: 1.4 }}>
                              <span style={{ fontWeight: 500 }}>{item.actor?.full_name || "Someone"}</span>{" "}
                              <span style={{ color: "#666" }}>{config.label}</span>
                            </p>
                          </div>

                          {/* Time */}
                          <span style={{ fontSize: "0.6875rem", color: "#ccc", flexShrink: 0 }}>
                            {formatTime(item.created_at)}
                          </span>
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
