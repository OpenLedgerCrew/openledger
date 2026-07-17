interface FallbackBadgeProps {
  onRetry: () => void;
}

/** Shown whenever a page is displaying the cached fallback snapshot instead of a live backend
 * response — so stale data is never presented with the same confidence as real data. */
export function FallbackBadge({ onRetry }: FallbackBadgeProps) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        backgroundColor: "#fef3c7",
        border: "1px solid #fde68a",
        borderRadius: 12,
        padding: "10px 16px",
        marginBottom: 20,
        fontSize: 13,
        color: "#92400e",
      }}
    >
      <span>
        <strong>Showing cached data.</strong> The live server didn't respond in time (it may be
        waking up) — this is the last known snapshot, not necessarily current.
      </span>
      <button
        onClick={onRetry}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 700,
          color: "#92400e",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Retry
      </button>
    </div>
  );
}
