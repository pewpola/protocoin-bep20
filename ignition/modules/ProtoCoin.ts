import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProtoCoinModule = buildModule("ProtoCoinModule", (m) => {
  
  const protoCoin = m.contract("ProtoCoin");

  return { protoCoin };
});

export default ProtoCoinModule;