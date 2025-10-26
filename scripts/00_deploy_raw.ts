// scripts/00_deploy_raw.ts
import hre from "hardhat";
import { encodeDeployData } from "viem/utils/abi/encodeDeployData.js";
import { encodeFunctionData } from "viem/utils/abi/encodeFunctionData.js";

type Hex = `0x${string}`;

async function firstAccount(): Promise<string> {
  const accounts = (await hre.network.provider.request({
    method: "eth_accounts",
    params: [],
  })) as string[];
  if (!accounts || accounts.length === 0) throw new Error("No accounts on provider");
  return accounts[0];
}

async function mineUntilMined(txHash: string) {
  let receipt: any = null;
  while (!receipt) {
    receipt = await hre.network.provider.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });
    if (!receipt) {
      await hre.network.provider.request({ method: "evm_mine", params: [] });
    }
  }
  return receipt;
}

async function deploy(name: string, args: any[] = []) {
  const from = await firstAccount();
  const artifact = await hre.artifacts.readArtifact(name);
  const data = encodeDeployData({
    abi: artifact.abi as any,
    bytecode: artifact.bytecode as Hex,
    args,
  });

  const txHash = (await hre.network.provider.request({
    method: "eth_sendTransaction",
    params: [{ from, data }],
  })) as string;

  const receipt: any = await mineUntilMined(txHash);
  const address = receipt.contractAddress as string;
  console.log(`${name}: ${address}`);
  return { address, abi: artifact.abi as any };
}

async function call({ to, abi }: { to: string; abi: any }, functionName: string, args: any[] = []) {
  const from = await firstAccount();
  const data = encodeFunctionData({ abi, functionName, args }) as Hex;

  const txHash = (await hre.network.provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to, data }],
  })) as string;

  await mineUntilMined(txHash);
}

async function main() {
  const admin = await firstAccount();
  console.log("Admin:", admin);

  // 1) RoleRegistry(admin)
  const roleRegistry = await deploy("RoleRegistry", [admin]);

  // 2) StakingPool (implementation)
  const stakingImpl = await deploy("StakingPool", []);

  // 3) StakingPoolFactory(admin, implementation)
  const factory = await deploy("StakingPoolFactory", [admin, stakingImpl.address]);

  // 4) ProjectRegistry(admin, roleRegistry, factory, protocolTreasury=admin)
  const projectRegistry = await deploy("ProjectRegistry", [
    admin,
    roleRegistry.address,
    factory.address,
    admin,
  ]);

  // 5) factory.grantRegistry(projectRegistry)
  await call(factory, "grantRegistry", [projectRegistry.address]);
  console.log("Granted REGISTRY_ROLE to ProjectRegistry");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
