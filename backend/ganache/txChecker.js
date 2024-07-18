import { ethers } from "ethers";
import { CONN } from "../../enum-global.js";
const provider = new ethers.providers.JsonRpcProvider(CONN.GANACHE_LOCAL);

export const txChecker = async (receipt) => {
  const gasPrice = await provider.getGasPrice();
  const gasPriceSepolia = 9346783;
  const gasUsed = receipt.gasUsed;
  const gasFee = gasUsed.mul(gasPrice);
  const gasFeeSepolia = gasUsed.mul(gasPriceSepolia);

  return {
    gasUsed: gasUsed.toString(),
    gasFeeWei: gasFee.toString(),
    gasFeeGwei: ethers.utils.formatUnits(gasFee, 'gwei'),
    gasFeeEther: ethers.utils.formatEther(gasFee),
    gasFeeWeiSepolia: gasFeeSepolia.toString(),
    gasFeeGweiSepolia: ethers.utils.formatUnits(gasFeeSepolia, 'gwei'),
    gasFeeEtherSepolia: ethers.utils.formatEther(gasFeeSepolia),
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.transactionHash,
  };
};