"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Search, Send, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface ConversationRow {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string;
  last_message_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface PartnerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string;
  interests: string[];
}

interface ConversationWithPartner extends ConversationRow {
  partner: PartnerProfile;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [authLoading, user, router]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setConversations([]);
      setLoadingConvos(false);
      return;
    }

    // Fetch partner profiles
    const partnerIds = convos.map((c: ConversationRow) =>
      c.participant_1 === user.id ? c.participant_2 : c.participant_1
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, location, interests")
      .in("id", partnerIds);

    const profileMap = new Map(
      (profiles || []).map((p: PartnerProfile) => [p.id, p])
    );

    const enriched: ConversationWithPartner[] = convos.map((c: ConversationRow) => {
      const partnerId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
      return {
        ...c,
        partner: profileMap.get(partnerId) || {
          id: partnerId,
          full_name: "Unknown",
          avatar_url: null,
          location: "",
          interests: [],
        },
      };
    });

    setConversations(enriched);
    setLoadingConvos(false);

    // Auto-select from URL param or first conversation
    const urlConvoId = searchParams.get("c");
    if (urlConvoId && enriched.find((c) => c.id === urlConvoId)) {
      setActiveId(urlConvoId);
      setMobileView("chat");
    } else if (!activeId && enriched.length > 0) {
      setActiveId(enriched[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as MessageRow[]);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => {
            // If we already have this message (by real ID), skip
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Replace optimistic temp message from same sender with real one
            const hasTemp = prev.some(
              (m) => m.id.startsWith("temp-") && m.sender_id === newMsg.sender_id && m.content === newMsg.content
            );
            if (hasTemp) {
              return prev.map((m) =>
                m.id.startsWith("temp-") && m.sender_id === newMsg.sender_id && m.content === newMsg.content
                  ? newMsg
                  : m
              );
            }
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !activeId) return;

    const content = input.trim();
    setInput("");

    // Optimistic update
    const optimistic: MessageRow = {
      id: `temp-${Date.now()}`,
      conversation_id: activeId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    // Insert into DB
    await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: user.id,
      content,
    });

    // Update conversation last_message
    await supabase
      .from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", activeId);

    // Refresh conversation list
    fetchConversations();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#aaa" }}>Loading…</p>
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId);

  const getInitials = (name: string | null) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", paddingTop: "4rem", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="hidden md:flex items-center justify-between px-6 lg:px-8 py-8" style={{ borderBottom: "1px solid #EFEFEF" }}>
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.375rem" }}>
              Messages
            </p>
            <h1 className="font-display" style={{ fontSize: "1.875rem", fontWeight: 500, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
              Your conversations.
            </h1>
          </div>
          <button
            onClick={() => router.push("/explore")}
            style={{ fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.04em", padding: "0.625rem 1.25rem", backgroundColor: "#0a0a0a", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
          >
            New Connection
          </button>
        </div>
      </div>

      {/* Chat layout */}
      <div className="flex flex-1" style={{ overflow: "hidden", height: "calc(100vh - 4rem - 97px)" }}>
        {/* Sidebar */}
        <div
          className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex flex-col`}
          style={{ width: "100%", maxWidth: 340, borderRight: "1px solid #EFEFEF", flexShrink: 0, overflowY: "auto" }}
        >
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F5F5F5" }}>
            <div className="flex items-center gap-2" style={{ border: "1px solid #EFEFEF", borderRadius: "4px", padding: "0.5rem 0.875rem" }}>
              <Search size={13} color="#ccc" />
              <input type="text" placeholder="Search messages…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: "0.8125rem", color: "#0a0a0a", backgroundColor: "transparent" }} />
            </div>
          </div>

          {loadingConvos ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>Loading…</p>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "#ccc", marginBottom: "0.5rem" }}>No conversations yet.</p>
              <p style={{ fontSize: "0.75rem", color: "#ddd" }}>Visit a profile and click Message to start.</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => { setActiveId(convo.id); setMobileView("chat"); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "0.875rem",
                  padding: "1.125rem 1.25rem",
                  backgroundColor: activeId === convo.id ? "#F8F8F8" : "transparent",
                  borderBottom: "1px solid #F8F8F8",
                  borderLeft: activeId === convo.id ? "2px solid #0a0a0a" : "2px solid transparent",
                  cursor: "pointer", textAlign: "left", width: "100%", transition: "background 0.15s ease",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {convo.partner.avatar_url ? (
                    <img src={convo.partner.avatar_url} alt="" width={42} height={42}
                      style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 600, color: "#555" }}>
                      {getInitials(convo.partner.full_name)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a" }}>
                      {convo.partner.full_name || "Unknown"}
                    </p>
                    <span style={{ fontSize: "0.6875rem", color: "#ccc", flexShrink: 0 }}>
                      {formatTime(convo.last_message_at)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: "0.8125rem", color: "#aaa",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {convo.last_message || "No messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat panel */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-col flex-1`} style={{ minWidth: 0, overflow: "hidden" }}>
          {!active ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "0.875rem", color: "#ccc" }}>Select a conversation to start messaging.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #EFEFEF", flexShrink: 0 }}>
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-1" onClick={() => setMobileView("list")}
                    style={{ color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
                    <ArrowLeft size={16} />
                  </button>
                  {active.partner.avatar_url ? (
                    <img src={active.partner.avatar_url} alt="" width={36} height={36}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#555" }}>
                      {getInitials(active.partner.full_name)}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a" }}>
                      {active.partner.full_name || "Unknown"}
                    </p>
                    <p style={{ fontSize: "0.6875rem", color: "#bbb" }}>
                      {active.partner.location || ""}{active.partner.interests?.[0] ? ` · ${active.partner.interests[0]}` : ""}
                    </p>
                  </div>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 py-6" style={{ scrollBehavior: "smooth" }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: "0.875rem", color: "#ddd", fontStyle: "italic" }}>
                      Say hello to {active.partner.full_name?.split(" ")[0] || "them"}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {msg.sender_id !== user.id && (
                        active.partner.avatar_url ? (
                          <img src={active.partner.avatar_url} alt="" width={28} height={28}
                            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", fontWeight: 600, color: "#555", flexShrink: 0 }}>
                            {getInitials(active.partner.full_name)}
                          </div>
                        )
                      )}
                      <div>
                        <div style={{
                          maxWidth: 400, padding: "0.75rem 1rem",
                          borderRadius: msg.sender_id === user.id ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          backgroundColor: msg.sender_id === user.id ? "#0a0a0a" : "#F3F3F3",
                          color: msg.sender_id === user.id ? "#fff" : "#0a0a0a",
                          fontSize: "0.875rem", lineHeight: 1.55,
                        }}>
                          {msg.content}
                        </div>
                        <p style={{
                          fontSize: "0.625rem", color: "#ddd", marginTop: "0.3rem",
                          textAlign: msg.sender_id === user.id ? "right" : "left",
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid #EFEFEF", flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder={`Message ${active.partner.full_name?.split(" ")[0] || ""}…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  style={{
                    flex: 1, border: "1px solid #EFEFEF", borderRadius: "24px",
                    padding: "0.625rem 1.125rem", fontSize: "0.875rem",
                    color: "#0a0a0a", outline: "none", backgroundColor: "#FAFAFA",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    backgroundColor: input.trim() ? "#0a0a0a" : "#F0F0F0",
                    color: input.trim() ? "#fff" : "#ccc",
                    border: "none", cursor: input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s ease",
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
