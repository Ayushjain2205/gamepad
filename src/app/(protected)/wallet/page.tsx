import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";
import { Pay } from "@/components/Pay";
import { Transaction } from "@/components/Transaction";
import { UserInfo } from "@/components/UserInfo";
import { Verify } from "@/components/Verify";
import { ViewPermissions } from "@/components/ViewPermissions";
import { Marble, TopBar } from "@worldcoin/mini-apps-ui-kit-react";

export default async function WalletPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="flex-shrink-0 bg-primary/50 backdrop-blur-sm border-b border-primary/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text font-heading">Wallet</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold capitalize text-text font-display">
              {session?.user.username}
            </p>
            <Marble src={session?.user.profilePictureUrl} className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          <UserInfo />
          <Verify />
          <Pay />
          <Transaction />
          <ViewPermissions />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex-shrink-0 bg-primary border-t border-primary/30 p-4 z-30">
        <div className="flex items-center justify-between px-8">
          {/* Home Icon */}
          <a
            href="/"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg
              className="w-7 h-7 pixelated-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>

          {/* Create Icon */}
          <a
            href="/create"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg
              className="w-7 h-7 pixelated-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </a>

          {/* Wallet Icon */}
          <a
            href="/wallet"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg
              className="w-7 h-7 pixelated-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
