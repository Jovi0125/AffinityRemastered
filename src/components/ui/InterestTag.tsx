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
        padding: size === "sm" ? "0.15rem 0.55rem" : "0.25rem 0.75rem",
        fontSize: size === "sm" ? "0.625rem" : "0.6875rem",
        fontWeight: 500,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        border: "1px solid",
        borderColor: filled ? "#7c3aed" : "#e9e5f5",
        backgroundColor: filled ? "#7c3aed" : "#f5f3ff",
        color: filled ? "#fff" : "#7c3aed",
        borderRadius: "20px",
        whiteSpace: "nowrap" as const,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </span>
  );
}
