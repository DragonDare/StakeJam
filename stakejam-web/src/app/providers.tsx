"use client";

import { WagmiProvider, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "StakeJam",
  projectId: "stakejam-local",                // fine for local
  chains: [sepolia],
  transports: { [sepolia.id]: http("https://sepolia.drpc.org") },
  ssr: true,                                  // avoid WC SSR issues when possible
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
