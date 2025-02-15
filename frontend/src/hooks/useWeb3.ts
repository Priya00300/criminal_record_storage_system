import { useState, useEffect } from "react";
import Web3 from "web3";
import CriminalRecordSystem from "../contracts/CriminalRecordSystem.json";

declare let window: any;

const useWeb3 = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = CriminalRecordSystem.networks[networkId];

          if (!deployedNetwork) {
            console.error("❌ Contract not deployed on this network.");
            return;
          }

          const instance = new web3Instance.eth.Contract(
            CriminalRecordSystem.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        console.log("🦊 Please install MetaMask!");
      }
    };

    initWeb3();
  }, []);

  return { web3, account, contract };
};

export default useWeb3;
