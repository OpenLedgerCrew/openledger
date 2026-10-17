import React, { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export interface ExportButtonProps {
  programmeId: string;
  className?: string;
}

/**
 * Section 6.3 — triggers the server-side PDF export with in-flight loading state and feedback toasts.
 */
export function ExportButton({ programmeId, className }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/programmes/${programmeId}/export.pdf`);
      if (!res.ok) throw new Error(`Export request failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${programmeId}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully");
    } catch {
      toast.error("Failed to export PDF report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className={className}
      aria-label="Export PDF report"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <FileText size={16} aria-hidden="true" />
      )}
      {loading ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
