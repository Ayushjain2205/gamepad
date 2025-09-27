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
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="6" y="2" width="4" height="4" />
              <rect x="2" y="6" width="4" height="4" />
              <rect x="10" y="6" width="4" height="4" />
              <rect x="4" y="10" width="8" height="4" />
            </svg>
          </a>

          {/* Create Button */}
          <a href="/create" className="hover:scale-110 transition-transform">
            <div className="pixelated-button px-3 py-1">
              <span className="text-[#202040] font-heading text-sm font-bold">
                Create
              </span>
            </div>
          </a>

          {/* Wallet Icon */}
          <a
            href="/wallet"
            className="hover:scale-110 transition-transform text-text"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 16 16">
              <rect x="2" y="6" width="12" height="2" />
              <rect x="3" y="8" width="10" height="6" />
              <rect x="5" y="10" width="2" height="2" />
              <rect x="9" y="10" width="2" height="2" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
