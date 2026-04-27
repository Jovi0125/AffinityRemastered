"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { ArrowLeft, Search, Send, MoreHorizontal, Check, CheckCheck, Video, Phone, Smile, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useBlocks } from "@/hooks/useBlocks";
import { PageTransition } from "@/components/ui/PageTransition";
import { OnlineIndicator, isUserOnline } from "@/components/ui/OnlineIndicator";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CallModal } from "@/components/ui/CallModal";

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
  read_at: string | null;
}

interface PartnerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string;
  interests: string[];
  last_seen_at: string | null;
}

interface ConversationWithPartner extends ConversationRow {
  partner: PartnerProfile;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { blockedIds } = useBlocks();
  const [conversations, setConversations] = useState<ConversationWithPartner[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Call State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);
  const [callAppId, setCallAppId] = useState<string | null>(null);
  const [callChannel, setCallChannel] = useState<string | null>(null);
  const [callerName, setCallerName] = useState("");
  const [callerAvatar, setCallerAvatar] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [activeCallConvoId, setActiveCallConvoId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();
  const { theme } = useTheme();
  const dk = theme === "dark";

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
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

    const partnerIds = convos.map((c: ConversationRow) =>
      c.participant_1 === user.id ? c.participant_2 : c.participant_1
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, location, interests, last_seen_at")
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
            location: "",
            interests: [],
            last_seen_at: null,
          },
        };
      });

    setConversations(enriched);
    setLoadingConvos(false);

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

    if (!user) return;

    const convoChannel = supabase
      .channel("conversations-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convoChannel);
    };
  }, [fetchConversations, user]);

  // Fetch messages for active conversation + live subscription
  useEffect(() => {
    if (!activeId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });

      if (data && isMounted) {
        setMessages((prev) => {
          const optimistic = prev.filter(
            (m) => m.id.startsWith("temp-") && !data.some(
              (d: MessageRow) => d.sender_id === m.sender_id && d.content === m.content
            )
          );
          return [...(data as MessageRow[]), ...optimistic];
        });
      }
    };

    fetchMessages();

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
            if (prev.some((m) => m.id === newMsg.id)) return prev;
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

    const pollInterval = setInterval(() => {
      if (isMounted) fetchMessages();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
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

    const optimistic: MessageRow = {
      id: `temp-${Date.now()}`,
      conversation_id: activeId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: user.id,
      content,
    });

    await supabase
      .from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", activeId);

    fetchConversations();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!activeId || !user) return;

    supabase.channel(`typing:${activeId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  };

  // Listen for partner typing
  useEffect(() => {
    if (!activeId || !user) return;

    const typingChannel = supabase
      .channel(`typing:${activeId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.user_id !== user.id) {
          setPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
      setPartnerTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, user]);

  // Handle Call Signaling
  useEffect(() => {
    if (!user) return;

    const callChannelObj = supabase
      .channel(`call_signal:${user.id}`)
      .on("broadcast", { event: "call_invite" }, (payload) => {
        // Incoming call
        const { convoId, callerName: cName, callerAvatar: cAvatar, callerId: cId } = payload.payload;
        setCallChannel(convoId);
        setCallerName(cName);
        setCallerAvatar(cAvatar);
        setCallerId(cId);
        setActiveCallConvoId(convoId);
        setIsIncomingCall(true);
        setIsCallModalOpen(true);
      })
      .on("broadcast", { event: "call_accept" }, async (payload) => {
        // Partner accepted the call
        if (isCallModalOpen && !isIncomingCall) {
          // Generate token and join
          const { convoId } = payload.payload;
          try {
            const res = await fetch("/api/agora/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channelName: convoId, uid: user.id }),
            });
            const data = await res.json();
            if (data.token) {
              setCallToken(data.token);
              setCallAppId(data.appId);
            }
          } catch (err) {
            console.error("Token error", err);
          }
        }
      })
      .on("broadcast", { event: "call_decline" }, () => {
        // Partner declined
        setIsCallModalOpen(false);
        setIsIncomingCall(false);
        setCallToken(null);
        setCallChannel(null);
      })
      .on("broadcast", { event: "call_end" }, () => {
        // Partner ended the call
        setIsCallModalOpen(false);
        setIsIncomingCall(false);
        setCallToken(null);
        setCallChannel(null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(callChannelObj);
    };
  }, [user, isCallModalOpen, isIncomingCall]);

  const initiateCall = async () => {
    if (!activeId || !user || !active) return;
    
    // Set local state to out-going
    setIsIncomingCall(false);
    setCallChannel(activeId);
    setCallerName(active.partner.full_name || "Unknown");
    setCallerAvatar(active.partner.avatar_url);
    setActiveCallConvoId(activeId);
    setIsCallModalOpen(true);

    // Get current user profile for the invite
    const { data: myProfile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();

    // Signal partner by temporarily joining their channel to broadcast
    const partnerChannel = supabase.channel(`call_signal:${active.partner.id}`);
    partnerChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        partnerChannel.send({
          type: "broadcast",
          event: "call_invite",
          payload: {
            convoId: activeId,
            callerId: user.id,
            callerName: myProfile?.full_name || "Someone",
            callerAvatar: myProfile?.avatar_url || null,
          },
        });
        setTimeout(() => supabase.removeChannel(partnerChannel), 2000);
      }
    });
  };

  const handleAcceptCall = async () => {
    if (!user) return;
    setIsIncomingCall(false);
    if (!callChannel || !callerId) return;

    // Signal acceptance back to caller
    const callerChannel = supabase.channel(`call_signal:${callerId}`);
    callerChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callerChannel.send({
          type: "broadcast",
          event: "call_accept",
          payload: { convoId: callChannel },
        });
        setTimeout(() => supabase.removeChannel(callerChannel), 2000);
      }
    });

    // Generate my token
    try {
      const res = await fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: callChannel, uid: user.id }),
      });
      const data = await res.json();
      if (data.token) {
        setCallToken(data.token);
        setCallAppId(data.appId);
      }
    } catch (err) {
      console.error("Token error", err);
    }
  };

  const handleDeclineCall = () => {
    if (callerId) {
      const callerChannel = supabase.channel(`call_signal:${callerId}`);
      callerChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          callerChannel.send({
            type: "broadcast",
            event: "call_decline",
            payload: { convoId: callChannel },
          });
          setTimeout(() => supabase.removeChannel(callerChannel), 2000);
        }
      });
    }
    setIsCallModalOpen(false);
    setIsIncomingCall(false);
    setCallChannel(null);
    setCallToken(null);
    setCallAppId(null);
  };

  const handleEndCall = () => {
    const partnerId = isIncomingCall ? callerId : active?.partner.id;
    if (partnerId) {
      const partnerChannel = supabase.channel(`call_signal:${partnerId}`);
      partnerChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          partnerChannel.send({
            type: "broadcast",
            event: "call_end",
            payload: { convoId: callChannel },
          });
          setTimeout(() => supabase.removeChannel(partnerChannel), 2000);
        }
      });
    }
    setIsCallModalOpen(false);
    setIsIncomingCall(false);
    setCallChannel(null);
    setCallToken(null);
  };

  // Mark messages as read when viewing
  useEffect(() => {
    if (!activeId || !user || messages.length === 0) return;

    const unreadFromPartner = messages.filter(
      (m) => m.sender_id !== user.id && !m.read_at && !m.id.startsWith("temp-")
    );

    if (unreadFromPartner.length > 0) {
      const ids = unreadFromPartner.map((m) => m.id);
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids)
        .then(() => {
          setMessages((prev) =>
            prev.map((m) =>
              ids.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
            )
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeId, user]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Loading…</p>
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
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMsgTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredConvos = searchTerm
    ? conversations.filter((c) => (c.partner.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
    : conversations;

  return (
    <PageTransition>
    <div style={{ backgroundColor: dk ? "#000" : "#faf9fd", minHeight: "100vh", paddingTop: "4rem", display: "flex", flexDirection: "column" }}>
      {/* Main chat layout */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 flex-1" style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: "24px",
            overflow: "hidden",
            backgroundColor: dk ? "#16181c" : "#fff",
            boxShadow: dk ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
            height: "calc(100vh - 8rem)",
          }}
        >
          {/* ─── Sidebar ─── */}
          <div
            className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex flex-col`}
            style={{
              width: "100%",
              maxWidth: 340,
              borderRight: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Sidebar header */}
            <div style={{ padding: "1.5rem 1.25rem 1rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: dk ? "#e7e9ea" : "#1a1a2e", marginBottom: "1rem" }}>
                Messages
              </h2>
              <div
                className="flex items-center gap-2"
                style={{
                  border: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  borderRadius: "12px",
                  padding: "0.5rem 0.875rem",
                  backgroundColor: dk ? "#1d1f23" : "#f7f7f9",
                }}
              >
                <Search size={14} color="#a1a1aa" />
                <input
                  type="text"
                  placeholder="Search conversations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1, border: "none", outline: "none",
                    fontSize: "0.8125rem", color: dk ? "#e7e9ea" : "#1a1a2e", backgroundColor: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loadingConvos ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.8125rem", color: "#ccc" }}>Loading…</p>
                </div>
              ) : filteredConvos.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "#ccc", marginBottom: "0.5rem" }}>No conversations yet.</p>
                  <p style={{ fontSize: "0.75rem", color: "#ddd" }}>Visit a profile and click Message to start.</p>
                </div>
              ) : (
                filteredConvos.map((convo) => {
                  const isActive = activeId === convo.id;
                  const online = convo.partner.last_seen_at ? isUserOnline(convo.partner.last_seen_at) : false;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => { setActiveId(convo.id); setMobileView("chat"); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.875rem 1.25rem",
                        backgroundColor: isActive ? (dk ? "rgba(168,85,247,0.1)" : "#f5f3ff") : "transparent",
                        borderBottom: `1px solid ${dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                        borderLeft: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                        cursor: "pointer", textAlign: "left", width: "100%",
                        transition: "all 0.15s ease",
                        border: "none",
                        borderBlockEnd: `1px solid ${dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                      }}
                    >
                      {/* Avatar with online dot */}
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {convo.partner.avatar_url ? (
                          <img src={convo.partner.avatar_url} alt="" width={44} height={44}
                            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.8125rem", fontWeight: 600, color: "#7c3aed",
                          }}>
                            {getInitials(convo.partner.full_name)}
                          </div>
                        )}
                        {online && (
                          <span style={{
                            position: "absolute", bottom: 1, right: 1,
                            width: 10, height: 10, borderRadius: "50%",
                            backgroundColor: "#22c55e", border: "2px solid #fff",
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500, color: isActive ? "#7c3aed" : (dk ? "#e7e9ea" : "#1a1a2e") }}>
                            {convo.partner.full_name || "Unknown"}
                          </p>
                          <span style={{ fontSize: "0.6875rem", color: "#bbb", flexShrink: 0 }}>
                            {formatTime(convo.last_message_at)}
                          </span>
                        </div>
                        <p style={{
                          fontSize: "0.8125rem", color: "#a1a1aa",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {convo.last_message || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ─── Chat Panel ─── */}
          <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-col flex-1`} style={{ minWidth: 0, overflow: "hidden" }}>
            {!active ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#ede9fe,#c4b5fd)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem" }}>
                    <MessageCircle size={22} color="#7c3aed" />
                  </div>
                  <p style={{ fontSize: "0.9375rem", color: "#a1a1aa" }}>Select a conversation to start messaging.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`, flexShrink: 0 }}>
                  <div className="flex items-center gap-3">
                    <button className="md:hidden p-1" onClick={() => setMobileView("list")}
                      style={{ color: "#a1a1aa", background: "none", border: "none", cursor: "pointer" }}>
                      <ArrowLeft size={16} />
                    </button>
                    {active.partner.avatar_url ? (
                      <img src={active.partner.avatar_url} alt="" width={40} height={40}
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8125rem", fontWeight: 600, color: "#7c3aed",
                      }}>
                        {getInitials(active.partner.full_name)}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: dk ? "#e7e9ea" : "#1a1a2e" }}>
                        {active.partner.full_name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {active.partner.last_seen_at && isUserOnline(active.partner.last_seen_at) ? (
                          <span style={{ fontSize: "0.6875rem", color: "#22c55e", fontWeight: 500 }}>Online</span>
                        ) : (
                          <span style={{ fontSize: "0.6875rem", color: "#bbb" }}>
                            {active.partner.location || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={initiateCall} style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: "4px" }}>
                      <Video size={18} />
                    </button>
                    <button onClick={initiateCall} style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: "4px" }}>
                      <Phone size={18} />
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: "4px" }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-6 py-6" style={{ scrollBehavior: "smooth", backgroundColor: dk ? "#000" : "#faf9fd" }}>
                  {messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ fontSize: "0.875rem", color: "#c4b5fd", fontStyle: "italic" }}>
                        Say hello to {active.partner.full_name?.split(" ")[0] || "them"}!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Today separator */}
                      <div className="flex items-center justify-center my-2">
                        <span style={{
                          fontSize: "0.6875rem", fontWeight: 600, color: "#a1a1aa",
                          backgroundColor: dk ? "#16181c" : "#fff", padding: "0.25rem 0.75rem",
                          borderRadius: "12px", textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                          Today
                        </span>
                      </div>
                      {messages.map((msg) => {
                        const isMine = msg.sender_id === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2`}>
                            {!isMine && (
                              active.partner.avatar_url ? (
                                <img src={active.partner.avatar_url} alt="" width={28} height={28}
                                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                              ) : (
                                <div style={{
                                  width: 28, height: 28, borderRadius: "50%",
                                  background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "0.5rem", fontWeight: 600, color: "#7c3aed", flexShrink: 0,
                                }}>
                                  {getInitials(active.partner.full_name)}
                                </div>
                              )
                            )}
                            <div>
                              <div style={{
                                maxWidth: 380,
                                padding: "0.75rem 1rem",
                                borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                background: isMine
                                  ? (dk ? "#1d1f23" : "#f0edf6")
                                  : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                                color: isMine ? (dk ? "#e7e9ea" : "#1a1a2e") : "#fff",
                                fontSize: "0.875rem",
                                lineHeight: 1.55,
                              }}>
                                {msg.content}
                              </div>
                              <div className="flex items-center gap-1" style={{
                                marginTop: "0.2rem",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                              }}>
                                <span style={{ fontSize: "0.625rem", color: "#bbb" }}>
                                  {formatMsgTime(msg.created_at)}
                                </span>
                                {isMine && !msg.id.startsWith("temp-") && (
                                  msg.read_at ? (
                                    <CheckCheck size={12} style={{ color: "#7c3aed" }} />
                                  ) : (
                                    <Check size={12} style={{ color: "#ccc" }} />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Typing indicator */}
                  {partnerTyping && (
                    <div className="flex items-end gap-2">
                      {active.partner.avatar_url ? (
                        <img src={active.partner.avatar_url} alt="" width={28} height={28}
                          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.5rem", fontWeight: 600, color: "#7c3aed", flexShrink: 0,
                        }}>
                          {getInitials(active.partner.full_name)}
                        </div>
                      )}
                      <div style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "18px 18px 18px 4px",
                        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                        display: "flex", alignItems: "center", gap: "3px",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.6)", animation: "typingBounce 1.4s infinite ease-in-out", animationDelay: "0s" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.6)", animation: "typingBounce 1.4s infinite ease-in-out", animationDelay: "0.2s" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.6)", animation: "typingBounce 1.4s infinite ease-in-out", animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`, flexShrink: 0, backgroundColor: dk ? "#16181c" : "#fff" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "#a1a1aa", padding: "4px", flexShrink: 0 }}>
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    style={{
                      flex: 1, border: `1px solid ${dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, borderRadius: "24px",
                      padding: "0.7rem 1.25rem", fontSize: "0.875rem",
                      color: dk ? "#e7e9ea" : "#1a1a2e", outline: "none", backgroundColor: dk ? "#1d1f23" : "#f7f7f9",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="transition-all duration-200"
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: input.trim() ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" : (dk ? "#1d1f23" : "#f0f0f0"),
                      color: input.trim() ? "#fff" : (dk ? "#555" : "#ccc"),
                      border: "none", cursor: input.trim() ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <CallModal
        isOpen={isCallModalOpen}
        isIncoming={isIncomingCall}
        partnerName={callerName || (active?.partner.full_name ?? "Unknown")}
        partnerAvatar={callerAvatar || (active?.partner.avatar_url ?? null)}
        channelName={callChannel}
        token={callToken}
        appId={callAppId}
        uid={user.id}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onEnd={handleEndCall}
      />
    </div>
    </PageTransition>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", color: "#a1a1aa" }}>Loading…</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
