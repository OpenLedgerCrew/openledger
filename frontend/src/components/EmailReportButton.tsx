import React from "react";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import type { ProgrammeAggregates } from "../types";

export interface EmailReportButtonProps {
  programmeId: string;
  programmeName: string;
  aggregates: ProgrammeAggregates | null;
  className?: string;
}

export function EmailReportButton({ programmeId, programmeName, aggregates, className }: EmailReportButtonProps) {
  const handleClick = () => {
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
        lines.push(`Delivery rate: ${(aggregates.delivery_rate * 100).toFixed(1)}%`);
      }
      lines.push("");
    }
    lines.push(`Full PDF report: ${pdfUrl}`);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
      aria-label={`Email report for ${programmeName}`}
    >
      <Mail size={16} aria-hidden="true" />
      Email Report
    </Button>
  );
}
