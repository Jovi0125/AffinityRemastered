"use client";

import { useState } from "react";
import { ArrowLeft, Search, Send, MoreHorizontal, ImageIcon, Smile } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { conversations } from "@/data/profiles";

type Message = { id: string; from: string; text: string; time: string };

export default function MessagesPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [input, setInput] = useState("");
  const [allConvos, setAllConvos] = useState(conversations);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const active = allConvos.find((c) => c.id === activeId)!;

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      from: "me",
      text: input.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    setAllConvos((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), timestamp: "Just now" }
          : c
      )
    );
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", paddingTop: "4rem", display: "flex", flexDirection: "column" }}>
      {/* Page heading — desktop */}
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
              <input
                type="text"
                placeholder="Search messages…"
                style={{ flex: 1, border: "none", outline: "none", fontSize: "0.8125rem", color: "#0a0a0a", backgroundColor: "transparent" }}
              />
            </div>
          </div>

          {allConvos.map((convo) => (
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
                <Image src={convo.profile.avatar} alt={convo.profile.name} width={42} height={42}
                  style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }} />
                {convo.unread > 0 && (
                  <div style={{
                    position: "absolute", top: -2, right: -2, width: 16, height: 16,
                    borderRadius: "50%", backgroundColor: "#0a0a0a", color: "#fff",
                    fontSize: "0.5625rem", display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 600, border: "2px solid #fff",
                  }}>
                    {convo.unread}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center justify-between mb-0.5">
                  <p style={{ fontSize: "0.875rem", fontWeight: convo.unread > 0 ? 600 : 500, color: "#0a0a0a" }}>
                    {convo.profile.name}
                  </p>
                  <span style={{ fontSize: "0.6875rem", color: "#ccc", flexShrink: 0 }}>{convo.timestamp}</span>
                </div>
                <p style={{
                  fontSize: "0.8125rem", color: convo.unread > 0 ? "#444" : "#aaa",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontWeight: convo.unread > 0 ? 500 : 400,
                }}>
                  {convo.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Chat panel */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-col flex-1`} style={{ minWidth: 0, overflow: "hidden" }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #EFEFEF", flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <button className="md:hidden p-1" onClick={() => setMobileView("list")}
                style={{ color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>
                <ArrowLeft size={16} />
              </button>
              <Image src={active.profile.avatar} alt={active.profile.name} width={36} height={36}
                style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }} />
              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#0a0a0a" }}>{active.profile.name}</p>
                <p style={{ fontSize: "0.6875rem", color: "#bbb" }}>
                  {active.profile.location} · {active.profile.interests[0]}
                </p>
              </div>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Shared interests */}
          <div className="flex items-center gap-2 px-6 py-3 flex-wrap" style={{ borderBottom: "1px solid #F5F5F5", backgroundColor: "#FAFAFA", flexShrink: 0 }}>
            <span style={{ fontSize: "0.6875rem", color: "#aaa" }}>Shared interests:</span>
            {active.profile.interests.slice(0, 3).map((i) => (
              <span key={i} style={{ fontSize: "0.625rem", padding: "0.15rem 0.5rem", border: "1px solid #E0E0E0", borderRadius: "2px", color: "#666" }}>
                {i}
              </span>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 py-6" style={{ scrollBehavior: "smooth" }}>
            {active.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} items-end gap-2`}>
                {msg.from === "them" && (
                  <Image src={active.profile.avatar} alt="" width={28} height={28}
                    style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{
                    maxWidth: 400, padding: "0.75rem 1rem",
                    borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: msg.from === "me" ? "#0a0a0a" : "#F3F3F3",
                    color: msg.from === "me" ? "#fff" : "#0a0a0a",
                    fontSize: "0.875rem", lineHeight: 1.55,
                  }}>
                    {msg.text}
                  </div>
                  <p style={{
                    fontSize: "0.625rem", color: "#ddd", marginTop: "0.3rem",
                    textAlign: msg.from === "me" ? "right" : "left",
                  }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid #EFEFEF", flexShrink: 0 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}><ImageIcon size={18} /></button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}><Smile size={18} /></button>
            <input
              type="text"
              placeholder={`Message ${active.profile.name.split(" ")[0]}…`}
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
        </div>
      </div>
    </div>
  );
}
