export interface ExportButtonProps {
  programmeId: string;
}

/**
 * Section 6.3 — triggers the server-side PDF export (D-8: the PDF renders from the same
 * template as the web view, so it cannot drift).
 */
export function ExportButton(_props: ExportButtonProps) {
  return (
    <button type="button" data-testid="not-implemented">
      Export
    </button>
  );
}
