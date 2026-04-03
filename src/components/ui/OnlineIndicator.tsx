"use client";

interface OnlineIndicatorProps {
  lastSeenAt: string | null | undefined;
  size?: number;
  showLabel?: boolean;
}

export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const diff = Date.now() - new Date(lastSeenAt).getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
}

export function getLastSeenLabel(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "";
  const diff = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Active now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;
  return "";
}

export function OnlineIndicator({ lastSeenAt, size = 10, showLabel = false }: OnlineIndicatorProps) {
  const online = isUserOnline(lastSeenAt);
  const label = getLastSeenLabel(lastSeenAt);

  if (!online && !showLabel) return null;

  return (
    <div className="flex items-center gap-1.5">
      {online && (
        <span
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            border: "2px solid #fff",
            display: "inline-block",
            flexShrink: 0,
            boxShadow: "0 0 0 1px rgba(34,197,94,0.3)",
          }}
        />
      )}
      {showLabel && label && (
        <span style={{ fontSize: "0.6875rem", color: online ? "#22c55e" : "#aaa" }}>
          {label}
        </span>
      )}
    </div>
  );
}
