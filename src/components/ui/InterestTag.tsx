interface InterestTagProps {
  label: string;
  filled?: boolean;
  size?: "sm" | "md";
}

export function InterestTag({ label, filled = false, size = "md" }: InterestTagProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: size === "sm" ? "0.2rem 0.6rem" : "0.3rem 0.85rem",
        fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
        fontWeight: 400,
        letterSpacing: "0.03em",
        border: "1px solid",
        borderColor: filled ? "#0a0a0a" : "#E8E8E8",
        backgroundColor: filled ? "#0a0a0a" : "#F8F8F8",
        color: filled ? "#fff" : "#666",
        borderRadius: "20px",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}
