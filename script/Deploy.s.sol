// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/src/Script.sol";
import "smart-contracts/src/CriminalRecordSystem.sol"; // Adjust the path to your contract
contract Deploy is Script {
    function run() external {
        // Load environment variables
        string memory privateKey = vm.envString("PRIVATE_KEY");
        address adminAddress = vm.envAddress("ADMIN_ADDRESS");
        uint256 deployerPrivateKey = vm.parseUint(privateKey);

        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract
        CriminalRecordSystem system = new CriminalRecordSystem();
        
        // Initial setup
        system.assignRegistrarRole(adminAddress);
        
        vm.stopBroadcast();

        // Log deployment details
        console.log("Contract deployed at:", address(system));
        console.log("Admin address:", adminAddress);
        console.log("Initial roles granted:");
        console.log("- ADMIN_ROLE: %s", vm.toString(system.ADMIN_ROLE()));
        console.log("- REGISTRAR_ROLE: %s", vm.toString(system.REGISTRAR_ROLE()));
    }
}