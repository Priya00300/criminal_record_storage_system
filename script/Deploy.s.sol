// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/src/Script.sol";
import "smart-contracts/src/CriminalRecordSystem.sol"; // Adjust the path to your contract
contract Deploy is Script {
    function run() external {
        // Load private key from .env as a string
        string memory privateKey = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = vm.parseUint(privateKey); // Convert to uint256
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        CriminalRecordSystem criminalRecordSystem = new CriminalRecordSystem();

        vm.stopBroadcast();

        // Log the contract address
        console.log("Contract deployed at:", address(criminalRecordSystem));
    }
}