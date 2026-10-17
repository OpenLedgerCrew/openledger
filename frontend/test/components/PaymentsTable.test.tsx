import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PaymentsTable } from "../../src/components/PaymentsTable";
import type { PaymentListItem } from "@/types/openledger";

describe("PaymentsTable", () => {
  const mockPayments: PaymentListItem[] = [
    {
      payment_id: "pay-001",
      reference_id: "REF-DW-1001",
      amount: "150.00",
      asset: "USDC",
      status: "SUCCESS",
      disbursed_at: "2026-10-14T08:30:00Z",
      blockchain_tx: {
        tx_hash: "3a8fe912a78b54c01289de456812bcfe34890123456789abcdef0123456789ab",
        explorer_url: "https://stellar.expert/explorer/testnet/tx/3a8fe912a78b54c01289de456812bcfe34890123456789abcdef0123456789ab",
        stellar_explorer_url: "https://stellar.expert/explorer/testnet/tx/3a8fe912a78b54c01289de456812bcfe34890123456789abcdef0123456789ab",
      },
      delivery: {
        status: "NOT_APPLICABLE",
        delivery_method: "DIRECT_WALLET",
      },
    },
    {
      payment_id: "pay-002",
      reference_id: "REF-LM-2002",
      amount: "100.00",
      asset: "USDC",
      status: "PENDING",
      disbursed_at: "2026-10-15T09:15:00Z",
      blockchain_tx: {
        tx_hash: null,
        explorer_url: null,
        stellar_explorer_url: null,
      },
      delivery: {
        status: "PENDING_ESCROW",
        delivery_method: "LASTMILE_ESCROW",
        is_lastmile: true,
        escrow_contract_id: "CCUENRJNRPVSIQG7LIHMUAVQOE5MIMYBFQQG7VXXRS4L5NTGALVX6IV5",
      },
    },
  ];

  it("renders table with all required columns and zero PII reference IDs", () => {
    const onSelect = vi.fn();
    render(<PaymentsTable payments={mockPayments} onSelectPayment={onSelect} />);

    // Columns
    expect(screen.getByText("Reference ID")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Disbursed Date")).toBeInTheDocument();
    expect(screen.getByText("Leg 1 (On-Chain)")).toBeInTheDocument();
    expect(screen.getByText("Leg 2 (Delivery)")).toBeInTheDocument();

    // Data rows
    expect(screen.getByText("REF-DW-1001")).toBeInTheDocument();
    expect(screen.getByText("150.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("2026-10-14")).toBeInTheDocument();

    expect(screen.getByText("REF-LM-2002")).toBeInTheDocument();
    expect(screen.getByText("100.00 USDC")).toBeInTheDocument();
    expect(screen.getByText("2026-10-15")).toBeInTheDocument();
  });

  it("renders Leg 1 status badge and external Stellar explorer link", () => {
    const onSelect = vi.fn();
    render(<PaymentsTable payments={mockPayments} onSelectPayment={onSelect} />);

    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();

    const explorerLink = screen.getByTestId("explorer-link-leg1");
    expect(explorerLink).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/testnet/tx/3a8fe912a78b54c01289de456812bcfe34890123456789abcdef0123456789ab"
    );
    expect(explorerLink).toHaveAttribute("target", "_blank");
  });

  it("renders Leg 2 delivery status badge and delivery method tags", () => {
    const onSelect = vi.fn();
    render(<PaymentsTable payments={mockPayments} onSelectPayment={onSelect} />);

    expect(screen.getByText("NOT_APPLICABLE")).toBeInTheDocument();
    expect(screen.getByText("PENDING_ESCROW")).toBeInTheDocument();

    expect(screen.getByText("Direct Wallet")).toBeInTheDocument();
    expect(screen.getByText("LastMile Escrow")).toBeInTheDocument();
  });

  it("triggers onSelectPayment with payment_id on row click", () => {
    const onSelect = vi.fn();
    render(<PaymentsTable payments={mockPayments} onSelectPayment={onSelect} />);

    const row = screen.getByTestId("payment-row-pay-001");
    fireEvent.click(row);

    expect(onSelect).toHaveBeenCalledWith("pay-001");
  });

  it("renders empty state when payments list is empty", () => {
    const onSelect = vi.fn();
    render(<PaymentsTable payments={[]} onSelectPayment={onSelect} />);

    expect(screen.getByTestId("payments-table-empty")).toHaveTextContent(
      "No payments found for this programme."
    );
  });
});
