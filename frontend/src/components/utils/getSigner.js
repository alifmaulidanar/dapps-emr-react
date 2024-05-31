import { ethers } from "ethers";
import { CONN } from "../../../../enum-global"

const getSigner = async () => {
  const win = window;
  if (!win.ethereum) {
    console.error("Metamask not detected");
    return null;
  }
  try {
    const accounts = await win.ethereum.request({ method: "eth_requestAccounts" });
    const selectedAccount = accounts[0];
    const provider = new ethers.providers.Web3Provider(win.ethereum);
    await provider.send("wallet_addEthereumChain", [
      {
        chainId: "0x539",
        chainName: "Ganache",
        nativeCurrency: {
          name: "ETH",
          symbol: "ETH",
        },
        rpcUrls: [CONN.GANACHE_LOCAL],
      },
    ]);
    const signer = provider.getSigner(selectedAccount);
    return signer;
  } catch (error) {
    console.error("Error setting up Web3Provider:", error);
    return null;
  }
};

export default getSigner;
