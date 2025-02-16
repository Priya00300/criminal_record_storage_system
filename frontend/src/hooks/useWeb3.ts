import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CriminalRecordSystem from "../contracts/CriminalRecordSystem.json" assert { type: "json" };
declare let window: any;

const useWeb3 = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "";

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Initialize the provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Get the signer
          const signer = await provider.getSigner();

          // Get the list of accounts
          const accounts = await provider.listAccounts();
          console.log("Accounts:", accounts); // Debugging: Check what's returned

          // Ensure accounts[0] is a string and set it
          if (accounts.length > 0 && typeof accounts[0] === "string") {
            setAccount(accounts[0]);
          } else {
            console.error("No accounts found or accounts[0] is not a string.");
          }

          // Initialize the contract
          const newContract = new ethers.Contract(
            contractAddress,
            CriminalRecordSystem.abi,
            signer
          );
          setContract(newContract);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        console.log("🦊 Please install MetaMask!");
      }
    };

    initWeb3();
  }, [contractAddress]);

  return { provider, account, contract };
};

export default useWeb3;