import React from "react";
import { Button } from "./ui/button";

export interface ExportButtonProps {
  programmeId: string;
  className?: string;
}

/**
 * Section 6.3 — triggers the server-side PDF export (D-8: the PDF renders from the same
 * template as the web view, so it cannot drift).
 */
export function ExportButton({ programmeId, className }: ExportButtonProps) {
  const handleExport = () => {
    // API endpoint for PDF export trigger
    window.open(`/api/programmes/${programmeId}/export`, "_blank");
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className={className}
    >
      Export PDF
    </Button>
  );
}
