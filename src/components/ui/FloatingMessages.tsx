"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, X, Maximize2, BellOff, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useBlocks } from "@/hooks/useBlocks";
import { isUserOnline, getLastSeenLabel } from "@/components/ui/OnlineIndicator";

interface ConversationRow {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_at: string;
}

interface PartnerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
}

interface ConversationWithPartner extends ConversationRow {
  partner: PartnerProfile;
}

export function FloatingMessages() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { blockedIds } = useBlocks();
  const supabase = createClient();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const partnerIds = convos.map((c: ConversationRow) =>
      c.participant_1 === user.id ? c.participant_2 : c.participant_1
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, last_seen_at")
      .in("id", partnerIds);

    const profileMap = new Map(
      (profiles || []).map((p: PartnerProfile) => [p.id, p])
    );

    const enriched: ConversationWithPartner[] = convos
      .filter((c: ConversationRow) => {
        const partnerId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        return !blockedIds.includes(partnerId);
      })
      .map((c: ConversationRow) => {
        const partnerId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        return {
          ...c,
          partner: profileMap.get(partnerId) || {
            id: partnerId,
            full_name: "Unknown",
            avatar_url: null,
            last_seen_at: null,
          },
        };
      });

    setConversations(enriched);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, blockedIds]);

  // Dedicated unread count fetcher
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    // Don't overwrite while popup is open (user already acknowledged)
    if (isOpenRef.current) return;
    try {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnreadCount(count || 0);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();

    if (!user) return;

    const channel = supabase
      .channel("floating-messages-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => fetchConversations()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchConversations();
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Poll unread count as a fallback in case realtime RLS blocks
    const unreadPoll = setInterval(() => fetchUnreadCount(), 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(unreadPoll);
    };
  }, [fetchConversations, fetchUnreadCount, user]);

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    setUnreadCount(0);
    // Get conversation IDs user is part of
    const { data: convos } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);
    if (convos && convos.length > 0) {
      const convoIds = convos.map((c: { id: string }) => c.id);
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .neq("sender_id", user.id)
        .is("read_at", null)
        .in("conversation_id", convoIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const closePopup = useCallback(() => {
    setIsOpen(false);
    isOpenRef.current = false;
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const openPopup = useCallback(() => {
    setIsOpen(true);
    isOpenRef.current = true;
    markAllAsRead();
  }, [markAllAsRead]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, closePopup]);

  if (authLoading || !user) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitials = (name: string | null) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div ref={panelRef} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Popup Panel */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 0,
          width: 360,
          maxHeight: 520,
          backgroundColor: "#fff",
          borderRadius: 12,
          border: "1px solid #E8E8E8",
          boxShadow: "0 16px 48px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          transformOrigin: "bottom right",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 12px",
            borderBottom: "1px solid #EFEFEF",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#0a0a0a",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Messages
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => {
                closePopup();
                router.push("/messages");
              }}
              title="Open full messages"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
                color: "#aaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F5F5F5";
                e.currentTarget.style.color = "#555";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#aaa";
              }}
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={() => closePopup()}
              title="Close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
                color: "#aaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F5F5F5";
                e.currentTarget.style.color = "#555";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#aaa";
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>Loading…</p>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "#ccc", marginBottom: 4 }}>
                No conversations yet
              </p>
              <p style={{ fontSize: "0.75rem", color: "#ddd" }}>
                Visit a profile and start chatting!
              </p>
            </div>
          ) : (
            conversations.map((convo) => {
              const online = isUserOnline(convo.partner.last_seen_at);
              const lastSeenLabel = getLastSeenLabel(convo.partner.last_seen_at);
              const subtitle = convo.last_message
                ? convo.last_message
                : lastSeenLabel || "Start a conversation";

              return (
                <button
                  key={convo.id}
                  onClick={() => {
                    closePopup();
                    router.push(`/messages?c=${convo.id}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #F8F8F8",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {convo.partner.avatar_url ? (
                      <img
                        src={convo.partner.avatar_url}
                        alt=""
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          backgroundColor: "#F0F0F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#555",
                        }}
                      >
                        {getInitials(convo.partner.full_name)}
                      </div>
                    )}
                    {/* Online dot */}
                    {online && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 1,
                          right: 1,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#22c55e",
                          border: "2.5px solid #fff",
                        }}
                      />
                    )}
                  </div>

                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                          color: "#0a0a0a",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 200,
                        }}
                      >
                        {convo.partner.full_name || "Unknown"}
                      </p>
                      {/* Mute icon for some variation */}
                      <BellOff
                        size={13}
                        style={{ color: "#ddd", flexShrink: 0 }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#aaa",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {subtitle}
                      {convo.last_message && (
                        <span style={{ color: "#ccc" }}>
                          {" · "}
                          {formatTime(convo.last_message_at)}
                        </span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (isOpen) {
            closePopup();
          } else {
            openPopup();
          }
        }}
        id="floating-messages-fab"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: isOpen ? "#2a2a4a" : "#0a0a0a",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 6px 28px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
          transition: "all 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
          transform: isOpen ? "scale(0.95)" : "scale(1)",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.boxShadow = "0 8px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen ? "scale(0.95)" : "scale(1)";
          e.currentTarget.style.boxShadow = isOpen
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 6px 28px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)";
        }}
      >
        {isOpen ? <X size={20} /> : <Edit size={19} />}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#ef4444",
              color: "#fff",
              fontSize: "0.625rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              border: "2px solid #fff",
              boxShadow: "none",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
