"use client";

import { useState } from "react";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";

interface PaymentOverlayProps {
  gameName: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export const PaymentOverlay = ({
  gameName,
  onPaymentSuccess,
  onPaymentError,
}: PaymentOverlayProps) => {
  const [buttonState, setButtonState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);

  const handlePayment = async () => {
    // Lets use Alex's username to pay!
    const address = (await MiniKit.getUserByUsername("alex")).walletAddress;
    setButtonState("pending");

    const res = await fetch("/api/initiate-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameName,
        amount: "1.00",
        currency: "USDC",
      }),
    });
    const { id } = await res.json();

    const result = await MiniKit.commandsAsync.pay({
      reference: id,
      to: address ?? "0x0000000000000000000000000000000000000000",
      tokens: [
        {
          symbol: Tokens.USDC,
          token_amount: tokenToDecimals(1.0, Tokens.USDC).toString(),
        },
      ],
      description: `Payment for ${gameName} game`,
    });

    console.log(result.finalPayload);
    if (result.finalPayload.status === "success") {
      setButtonState("success");
      // Store purchase in localStorage for now (in production, this should be server-side)
      const purchasedGames = JSON.parse(
        localStorage.getItem("purchasedGames") || "[]"
      );
      if (!purchasedGames.includes(gameName)) {
        purchasedGames.push(gameName);
        localStorage.setItem("purchasedGames", JSON.stringify(purchasedGames));
      }
      onPaymentSuccess();
      // It's important to actually check the transaction result on-chain
      // You should confirm the reference id matches for security
      // Read more here: https://docs.world.org/mini-apps/commands/pay#verifying-the-payment
    } else {
      setButtonState("failed");
      onPaymentError(result.finalPayload.error_code || "Payment failed");
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20">
      <div
        className="max-w-sm w-full mx-4 relative"
        style={{
          background: "#0d1117",
          border: "3px solid #00e5ff",
          boxShadow:
            "0px 0px 20px rgba(0, 229, 255, 0.5), inset 0px 0px 20px rgba(0, 229, 255, 0.1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-cyan-400">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              🔒 PREMIUM GAME
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className="font-heading text-lg text-white mb-2">
            Unlock this game for
          </p>
          <div className="font-heading text-3xl font-bold text-cyan-400 mb-6">
            $1.00 USDC
          </div>

          <LiveFeedback
            label={{
              failed: "Payment failed",
              pending: "Processing payment...",
              success: "Payment successful!",
            }}
            state={buttonState}
            className="w-full"
          >
            <Button
              onClick={handlePayment}
              disabled={buttonState === "pending"}
              size="lg"
              variant="primary"
              className="w-full font-heading"
            >
              {buttonState === "pending" ? "Processing..." : "Pay Now - $1.00"}
            </Button>
          </LiveFeedback>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-cyan-400"></div>
      </div>
    </div>
  );
};
