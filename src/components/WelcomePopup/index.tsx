"use client";

import { useState, useEffect } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useVerified } from "@/providers/VerifiedProvider";

interface WelcomePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function WelcomePopup({
  isVisible,
  onClose,
}: WelcomePopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);
  const { setIsVerified } = useVerified();

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Remove auto-close functionality - only close on outside click
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationState("pending");

    try {
      const result = await MiniKit.commandsAsync.verify({
        action: "not-a-bot",
        verification_level: VerificationLevel.Device,
      });

      console.log(result.finalPayload);

      // Verify the proof
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        body: JSON.stringify({
          payload: result.finalPayload,
          action: "not-a-bot",
        }),
      });

      const data = await response.json();
      if (data.verifyRes.success) {
        setVerificationState("success");
        setIsVerified(true);
        // Close popup after successful verification
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setVerificationState("failed");
        // Reset the state after 3 seconds
        setTimeout(() => {
          setVerificationState(undefined);
        }, 3000);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationState("failed");
      setTimeout(() => {
        setVerificationState(undefined);
      }, 3000);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-gradient-to-br from-primary to-primary/80 border-2 border-accent rounded-lg p-6 mx-4 max-w-sm w-full shadow-2xl transition-all duration-200 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          boxShadow:
            "0px 0px 30px rgba(0, 229, 255, 0.4), inset 0px 0px 20px rgba(0, 229, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-accent hover:text-white transition-colors font-heading text-xl"
        >
          ×
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-text font-heading mb-2">
            NO BOT ZONE
          </h2>
          <p className="text-text-muted font-display text-sm mb-8">
            Verify that you are a human to continue.
          </p>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || verificationState === "pending"}
            className={`w-full py-3 px-6 font-heading font-bold text-lg rounded-lg transition-all duration-200 ${
              verificationState === "success"
                ? "bg-green-600 text-white"
                : verificationState === "failed"
                ? "bg-red-600 text-white"
                : verificationState === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-accent text-[#202040] hover:bg-accent/80 hover:scale-105"
            } ${isVerifying ? "animate-pulse" : ""}`}
            style={{
              boxShadow:
                verificationState === "success"
                  ? "0px 0px 20px rgba(34, 197, 94, 0.5)"
                  : verificationState === "failed"
                  ? "0px 0px 20px rgba(239, 68, 68, 0.5)"
                  : verificationState === "pending"
                  ? "0px 0px 20px rgba(234, 179, 8, 0.5)"
                  : "0px 0px 15px rgba(0, 229, 255, 0.3)",
            }}
          >
            {verificationState === "pending"
              ? "Verifying..."
              : verificationState === "success"
              ? "✅ Verified!"
              : verificationState === "failed"
              ? "❌ Failed"
              : "Verify"}
          </button>

          {verificationState === "failed" && (
            <p className="text-red-400 font-display text-xs mt-2">
              Verification failed. Please try again.
            </p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1 left-1 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    </div>
  );
}
