import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-ignition-viem";

import type { HardhatUserConfig } from "hardhat/config";

// Enable plugins via side-effect imports (no plugins array)
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-viem-assertions";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-ethers";          // ethers support




// If you like using env vars through Hardhat's config variables:
import { configVariable } from "hardhat/config";

// 0.8.28 works with OpenZeppelin v5; you can also use 0.8.24 if you prefer
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },

  // Keep networks simple; the `edr-simulated` entries come from the toolbox example.
  // Use the built-in `hardhat` network for local, and HTTP for Sepolia.
  networks: {
  hardhat: {
    type: "edr-simulated",
    // optional:
    // chainId: 31337,
  },

  sepolia: {
    type: "http",
    url: configVariable("SEPOLIA_RPC_URL"),
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")], // pk hex string, no 0x needed? (both are accepted)
  },
},

};

export default config;
