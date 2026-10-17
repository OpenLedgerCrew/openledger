import React from "react";
import type { ProgrammeSummary } from "@/types/openledger";
import { formatAmount, formatDeliveryRate } from "@/utils/formatters";

export interface ProgrammeHeaderProps {
  programme: ProgrammeSummary;
}

export function ProgrammeHeader({ programme }: ProgrammeHeaderProps) {
  const { name, country_code, currency, status, metrics } = programme;

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    COMPLETED: "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-300",
    PAUSED: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
  };

  const currentStatusStyle =
    statusStyles[status] ||
    "bg-muted text-muted-foreground border-border";

  const formattedDisbursed = `${formatAmount(metrics.total_disbursed)} ${currency}`;
  const formattedDeliveriesRatio = `${metrics.confirmed_deliveries_count} / ${metrics.total_payments_count}`;
  const formattedDeliveryRate = formatDeliveryRate(metrics.delivery_rate);

  return (
    <header className="flex flex-col gap-6 w-full" data-testid="programme-header">
      {/* Title & Metadata Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Programme Details</span>
            <span>•</span>
            <span data-testid="programme-country">{country_code}</span>
            <span>•</span>
            <span data-testid="programme-currency">{currency}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-serif font-bold text-foreground tracking-tight"
            data-testid="programme-title"
          >
            {name}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentStatusStyle}`}
            data-testid="programme-status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
            {country_code}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border border-border">
            {currency}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="programme-kpis">
        {/* KPI Card 1: Total Disbursed */}
        <div
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          data-testid="kpi-total-disbursed"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Disbursed
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-foreground">
            {formattedDisbursed}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Cumulative across {metrics.total_payments_count} payments
          </div>
        </div>

        {/* KPI Card 2: Confirmed Deliveries */}
        <div
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          data-testid="kpi-confirmed-deliveries"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Confirmed Deliveries
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-foreground">
            {formattedDeliveriesRatio}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {metrics.successful_payments_count} successful disbursements
          </div>
        </div>

        {/* KPI Card 3: Delivery Rate */}
        <div
          className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          data-testid="kpi-delivery-rate"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Delivery Rate
          </div>
          <div className="mt-2 text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
            {formattedDeliveryRate}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Field delivery confirmation ratio
          </div>
        </div>
      </div>
    </header>
  );
}
export default ProgrammeHeader;
