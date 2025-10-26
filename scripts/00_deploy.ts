// scripts/00_deploy.ts
const mod = await import("hardhat");
const hre: any = (mod as any).default ?? mod;   // support both forms
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const me = await deployer.getAddress();
  console.log("Deployer:", me);

  const RoleRegistry = await ethers.getContractFactory("RoleRegistry");
  const roleReg = await RoleRegistry.deploy(me);
  await roleReg.waitForDeployment();
  console.log("RoleRegistry:", await roleReg.getAddress());

  const StakingPool = await ethers.getContractFactory("StakingPool");
  const stakingImpl = await StakingPool.deploy();
  await stakingImpl.waitForDeployment();
  console.log("StakingPool impl:", await stakingImpl.getAddress());

  const StakingPoolFactory = await ethers.getContractFactory("StakingPoolFactory");
  const factory = await StakingPoolFactory.deploy(me, await stakingImpl.getAddress());
  await factory.waitForDeployment();
  console.log("Factory:", await factory.getAddress());

  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const projectReg = await ProjectRegistry.deploy(
    me,                                // admin
    await roleReg.getAddress(),        // RoleRegistry
    await factory.getAddress(),        // StakingPoolFactory
    me                                 // protocolTreasury
  );
  await projectReg.waitForDeployment();
  console.log("ProjectRegistry:", await projectReg.getAddress());

  const grantTx = await factory.grantRegistry(await projectReg.getAddress());
  await grantTx.wait();
  console.log("Granted REGISTRY_ROLE to ProjectRegistry");
}
main().catch((e) => { console.error(e); process.exit(1); });
