import React, { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import type { ProgrammeAggregates } from "../types";
import { formatDeliveryRate } from "../utils/formatters";
import { toast } from "sonner";

export interface EmailReportButtonProps {
  programmeId: string;
  programmeName: string;
  aggregates: ProgrammeAggregates | null;
  className?: string;
}

export function EmailReportButton({ programmeId, programmeName, aggregates, className }: EmailReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/programmes/${programmeId}/export.pdf`);
      if (!res.ok) throw new Error(`Report generation failed (${res.status})`);

      const pdfUrl = `${window.location.origin}/api/programmes/${programmeId}/export.pdf`;
      const subject = `OpenLedger impact report — ${programmeName}`;
      const lines = [
        `Impact report for ${programmeName}`,
        "",
        "Verified on the public Stellar blockchain — no login required to check.",
        "",
      ];
      if (aggregates) {
        for (const t of aggregates.totals_by_asset) {
          lines.push(`Total disbursed (${t.asset}): ${t.total}`);
        }
        lines.push(`Payments settled: ${aggregates.payment_count.settled}`);
        if (aggregates.delivery_rate !== null) {
          lines.push(`Delivery rate: ${formatDeliveryRate(aggregates.delivery_rate)}`);
        }
        lines.push("");
      }
      lines.push(`Full PDF report: ${pdfUrl}`);
      const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      window.location.href = mailto;
      toast.success("Email client opened with impact report summary");
    } catch {
      toast.error("Failed to prepare email report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={className}
      aria-label={`Email report for ${programmeName}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <Mail size={16} aria-hidden="true" />
      )}
      {loading ? "Preparing..." : "Email Report"}
    </Button>
  );
}
