import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { profiles } from "@/data/profiles";

const messages = [
  { from: "them", text: "Your photo series was stunning. What film stock were you using?", time: "10:12" },
  { from: "me",   text: "Kodak Portra 400, slightly overexposed. Gives those soft highlights.", time: "10:15" },
  { from: "them", text: "That makes so much sense. Do you ever shoot Ilford?", time: "10:18" },
  { from: "me",   text: "HP5 is basically my personality at this point.", time: "10:19" },
];

export function ChatPreview() {
  return (
    <div
      style={{
        border: "1px solid #E8E8E8",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fff",
        maxWidth: 400,
        boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
        <Image
          src={profiles[0].avatar}
          alt={profiles[0].name}
          width={36}
          height={36}
          style={{ borderRadius: "50%", objectFit: "cover", filter: "grayscale(100%)" }}
        />
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0a0a0a" }}>
            {profiles[0].name}
          </p>
          <p style={{ fontSize: "0.6875rem", color: "#bbb" }}>Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 p-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              style={{
                maxWidth: "75%",
                padding: "0.625rem 0.875rem",
                borderRadius: msg.from === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                backgroundColor: msg.from === "me" ? "#0a0a0a" : "#F5F5F5",
                color: msg.from === "me" ? "#fff" : "#0a0a0a",
                fontSize: "0.8125rem",
                lineHeight: 1.55,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div
          style={{
            flex: 1,
            padding: "0.5rem 0.875rem",
            border: "1px solid #E8E8E8",
            borderRadius: "20px",
            fontSize: "0.8125rem",
            color: "#ccc",
          }}
        >
          Message Maya…
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowRight size={14} color="#fff" />
        </div>
      </div>
    </div>
  );
}
