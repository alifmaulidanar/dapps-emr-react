import { ethers } from "ethers";
import { CONN } from "../../enum-global.js";
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

export const txChecker = async (receipt) => {
  const gasPrice = await provider.getGasPrice();
  const gasUsed = receipt.gasUsed;
  const gasFee = gasUsed.mul(gasPrice);

  return {
    gasUsed: gasUsed.toString(),
    gasFeeWei: gasFee.toString(),
    gasFeeGwei: ethers.utils.formatUnits(gasFee, 'gwei'),
    gasFeeEther: ethers.utils.formatEther(gasFee),
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.transactionHash,
  };
};