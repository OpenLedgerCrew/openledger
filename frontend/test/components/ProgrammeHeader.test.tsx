import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgrammeHeader } from "../../src/components/ProgrammeHeader";
import type { ProgrammeSummary } from "@/types/openledger";

describe("ProgrammeHeader", () => {
  const mockProgramme: ProgrammeSummary = {
    programme_id: "prog-test-01",
    name: "Kenya Drought Relief Programme",
    country_code: "KE",
    currency: "KES",
    status: "ACTIVE",
    metrics: {
      total_disbursed: "5000000.00",
      total_payments_count: 1000,
      successful_payments_count: 980,
      confirmed_deliveries_count: 954,
      delivery_rate: 0.954,
      last_updated_at: "2026-10-15T12:00:00Z",
    },
  };

  it("renders programme title, status badge, country code, and currency", () => {
    render(<ProgrammeHeader programme={mockProgramme} />);

    expect(screen.getByTestId("programme-title")).toHaveTextContent("Kenya Drought Relief Programme");
    expect(screen.getByTestId("programme-status")).toHaveTextContent("ACTIVE");
    expect(screen.getByTestId("programme-country")).toHaveTextContent("KE");
    expect(screen.getByTestId("programme-currency")).toHaveTextContent("KES");
  });

  it("renders KPI 1: Total Disbursed with currency", () => {
    render(<ProgrammeHeader programme={mockProgramme} />);

    const kpi1 = screen.getByTestId("kpi-total-disbursed");
    expect(kpi1).toHaveTextContent("Total Disbursed");
    expect(kpi1).toHaveTextContent("5,000,000.00 KES");
  });

  it("renders KPI 2: Confirmed Deliveries ratio", () => {
    render(<ProgrammeHeader programme={mockProgramme} />);

    const kpi2 = screen.getByTestId("kpi-confirmed-deliveries");
    expect(kpi2).toHaveTextContent("Confirmed Deliveries");
    expect(kpi2).toHaveTextContent("954 / 1000");
  });

  it("renders KPI 3: Delivery Rate formatted percentage", () => {
    render(<ProgrammeHeader programme={mockProgramme} />);

    const kpi3 = screen.getByTestId("kpi-delivery-rate");
    expect(kpi3).toHaveTextContent("Delivery Rate");
    expect(kpi3).toHaveTextContent("95.4%");
  });

  it("renders COMPLETED status badge accurately", () => {
    const completedProgramme: ProgrammeSummary = {
      ...mockProgramme,
      status: "COMPLETED",
    };
    render(<ProgrammeHeader programme={completedProgramme} />);
    expect(screen.getByTestId("programme-status")).toHaveTextContent("COMPLETED");
  });
});
