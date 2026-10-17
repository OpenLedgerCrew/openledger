import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PaymentDetailModal } from "../../src/components/PaymentDetailModal";
import * as api from "../../src/services/api";
import type { PaymentDetail } from "@/types/openledger";

describe("PaymentDetailModal", () => {
  const mockPaymentDetail: PaymentDetail = {
    payment_id: "pay-modal-01",
    reference_id: "REF-LM-9901",
    programme_id: "prog-test-01",
    amount: "250.00",
    asset: "USDC",
    status: "SUCCESS",
    created_at: "2026-10-15T08:00:00Z",
    disbursed_at: "2026-10-15T08:15:00Z",
    leg_1_funds_sent: {
      status: "SUCCESS",
      amount: "250.00",
      asset: "USDC",
      description: "Funds disbursed through on-chain Soroban escrow pipeline.",
      tx_hash: "abcd1234efgh5678",
      explorer_url: "https://stellar.expert/explorer/testnet/tx/abcd1234efgh5678",
      stellar_explorer_url: "https://stellar.expert/explorer/testnet/tx/abcd1234efgh5678",
      settled_at: "2026-10-15T08:15:00Z",
    },
    leg_2_cash_delivered: {
      status: "CONFIRMED",
      description: "Cash delivered to beneficiary verified with physical PIN voucher.",
      is_lastmile: true,
      confirmed_at: "2026-10-15T09:30:00Z",
      escrow_contract_id: "CCUENRJNRPVSIQG7LIHMUAVQOE5MIMYBFQQG7VXXRS4L5NTGALVX6IV5",
      anchoring_tx_hash: "90abcdef12345678",
      explorer_url: "https://stellar.expert/explorer/testnet/tx/90abcdef12345678",
      stellar_explorer_url: "https://stellar.expert/explorer/testnet/tx/90abcdef12345678",
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <PaymentDetailModal
        paymentId="pay-modal-01"
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId("payment-detail-modal")).not.toBeInTheDocument();
  });

  it("fetches payment detail and displays header and two legs of proof", async () => {
    vi.spyOn(api, "getPaymentDetail").mockResolvedValueOnce(mockPaymentDetail);

    render(
      <PaymentDetailModal
        paymentId="pay-modal-01"
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Verify modal appears
    expect(screen.getByTestId("payment-detail-modal")).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByTestId("modal-reference-id")).toHaveTextContent("REF-LM-9901");
    });

    expect(screen.getByTestId("modal-amount")).toHaveTextContent("250.00 USDC");
    expect(screen.getByTestId("modal-overall-status")).toHaveTextContent("SUCCESS");

    // Leg 1: Funds Sent
    const leg1 = screen.getByTestId("leg-1-funds-sent");
    expect(leg1).toHaveTextContent("Leg 1: Funds Sent (On-Chain Settlement)");
    expect(leg1).toHaveTextContent("Funds disbursed through on-chain Soroban escrow pipeline.");
    expect(leg1).toHaveTextContent("abcd1234efgh5678");

    const explorerButton = screen.getByTestId("verify-stellar-explorer-button");
    expect(explorerButton).toHaveTextContent("Verify on Stellar Explorer");
    expect(explorerButton).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/testnet/tx/abcd1234efgh5678"
    );

    // Leg 2: Cash Delivered
    const leg2 = screen.getByTestId("leg-2-cash-delivered");
    expect(leg2).toHaveTextContent("Leg 2: Cash Delivered (Field Confirmation)");
    expect(leg2).toHaveTextContent("Cash delivered to beneficiary verified with physical PIN voucher.");
    expect(screen.getByTestId("delivery-mode-tag")).toHaveTextContent("PIN Escrow Delivery");
    expect(leg2).toHaveTextContent("CONFIRMED");
    expect(leg2).toHaveTextContent("CCUENRJNRPVSIQG7LIHMUAVQOE5MIMYBFQQG7VXXRS4L5NTGALVX6IV5");
    expect(leg2).toHaveTextContent("90abcdef12345678");
  });

  it("calls onClose when close button is clicked", async () => {
    vi.spyOn(api, "getPaymentDetail").mockResolvedValueOnce(mockPaymentDetail);
    const onClose = vi.fn();

    render(
      <PaymentDetailModal
        paymentId="pay-modal-01"
        isOpen={true}
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("modal-reference-id")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
