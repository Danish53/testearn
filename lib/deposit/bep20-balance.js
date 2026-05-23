import { ethers } from "ethers";
import { USDT_BEP20_CONTRACT } from "@/lib/deposit/constants";
import { createBscProvider, getBscRpcUrls } from "@/lib/deposit/bsc-rpc";

/** Current USDT BEP20 balance on BSC for an address (for deposit diagnostics). */
export async function getBep20UsdtBalance(toAddress) {
  if (!toAddress) return 0;
  const provider = createBscProvider(getBscRpcUrls()[0]);
  const contract = new ethers.Contract(
    USDT_BEP20_CONTRACT,
    ["function balanceOf(address) view returns (uint256)"],
    provider
  );
  const bal = await contract.balanceOf(ethers.getAddress(toAddress));
  return Number(ethers.formatUnits(bal, 18));
}
