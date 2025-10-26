import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StakeJamModule = buildModule("StakeJamModule", (m) => {
  // Use the first account as admin/treasury
  const admin = m.getAccount(0);

  // 1) RoleRegistry(admin)
  const roleRegistry = m.contract("RoleRegistry", [admin]);

  // 2) StakingPool implementation (no args)
  const stakingImpl = m.contract("StakingPool");

  // 3) StakingPoolFactory(admin, implementation)
  const factory = m.contract("StakingPoolFactory", [admin, stakingImpl]);

  // 4) ProjectRegistry(admin, roleRegistry, factory, protocolTreasury=admin)
  const projectRegistry = m.contract("ProjectRegistry", [
    admin,
    roleRegistry,
    factory,
    admin,
  ]);

  // 5) Grant ProjectRegistry REGISTRY_ROLE on the factory
  m.call(factory, "grantRegistry", [projectRegistry]);

  // Export addresses so Ignition prints them
  return { roleRegistry, stakingImpl, factory, projectRegistry };
});

export default StakeJamModule;
