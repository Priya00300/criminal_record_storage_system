// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/forge-std/src/Test.sol";
import "smart-contracts/src/CriminalRecordSystem.sol";

contract CriminalRecordSystemTest is Test {
    CriminalRecordSystem criminalRecordSystem;
    address admin = address(1);
    address registrar = address(2);
    address viewer = address(3);
    address editor = address(4);
    address testCriminal = address(5);
function setUp() public {
    // Deploy the contract normally (no prank)
    criminalRecordSystem = new CriminalRecordSystem();

    // Now manually grant admin role to `admin`
    vm.startPrank(address(this)); // Start acting as the deployer
    criminalRecordSystem.grantRole(criminalRecordSystem.DEFAULT_ADMIN_ROLE(), admin);
    vm.stopPrank(); // Stop acting as deployer

    // Now, `admin` has the admin role and can assign others
    vm.startPrank(admin);
    criminalRecordSystem.assignRegistrarRole(registrar);
    criminalRecordSystem.grantRole(criminalRecordSystem.EDITOR_ROLE(), editor);
    criminalRecordSystem.grantRole(criminalRecordSystem.VIEWER_ROLE(), viewer);
    vm.stopPrank();
}


    function testRegisterCriminal() public {
        vm.prank(registrar); // Simulate as registrar
        criminalRecordSystem.registerCriminal(testCriminal);

        // Fetch the record
        CriminalRecordSystem.CriminalRecord memory record = criminalRecordSystem.getRecord(1);

        // Assert the values
        assertEq(record.id, 1);
        assertEq(record.criminal, testCriminal);
        assertEq(record.crimeIds.length, 0); // Ensure crimeIds is empty
    }

    function testAddCrime() public {
        vm.prank(registrar);
        criminalRecordSystem.registerCriminal(testCriminal);

        vm.prank(registrar);
        criminalRecordSystem.addCrime(1, "Theft", "QmHashIPFS");

        // Fetch the crime
        (uint256 crimeId, string memory description, string memory ipfsHash) = criminalRecordSystem.crimes(1);

        // Assert the values
        assertEq(crimeId, 1);
        assertEq(description, "Theft");
        assertEq(ipfsHash, "QmHashIPFS");

        // Verify the crime is linked to the criminal record
        CriminalRecordSystem.CriminalRecord memory record = criminalRecordSystem.getRecord(1);
        assertEq(record.crimeIds.length, 1);
        assertEq(record.crimeIds[0], 1);
    }

    function testUpdateCriminal() public {
        vm.prank(registrar);
        criminalRecordSystem.registerCriminal(testCriminal);

        vm.prank(editor);
        criminalRecordSystem.updateCriminal(1, address(6));

        // Fetch the updated record
        CriminalRecordSystem.CriminalRecord memory record = criminalRecordSystem.getRecord(1);

        // Assert the updated criminal address
        assertEq(record.criminal, address(6));
    }

    function testDeactivateRecord() public {
        vm.prank(registrar);
        criminalRecordSystem.registerCriminal(testCriminal);

        vm.prank(editor);
        criminalRecordSystem.deactivateRecord(1);

        // Verify the record is deactivated
        assertTrue(criminalRecordSystem.deactivatedRecords(1));
    }

    function testAddPoliceAuthority() public {
        vm.prank(admin);
        criminalRecordSystem.addPoliceAuthority(registrar, "John Doe", "12345");

        // Fetch the police authority
        (address authorityAddress, string memory name, string memory badgeNumber, bool isActive) = criminalRecordSystem.policeAuthorities(registrar);

        // Assert the values
        assertEq(authorityAddress, registrar);
        assertEq(name, "John Doe");
        assertEq(badgeNumber, "12345");
        assertTrue(isActive);

        // Verify the registrar role is granted
        assertTrue(criminalRecordSystem.hasRole(criminalRecordSystem.REGISTRAR_ROLE(), registrar));
    }

    function testChangePoliceAuthorityStatus() public {
        vm.prank(admin);
        criminalRecordSystem.addPoliceAuthority(registrar, "John Doe", "12345");

        vm.prank(admin);
        criminalRecordSystem.changePoliceAuthorityStatus(registrar, false);

        // Fetch the police authority
        (, , , bool isActive) = criminalRecordSystem.policeAuthorities(registrar);

        // Assert the status is updated
        assertFalse(isActive);

        // Verify the registrar role is revoked
        assertFalse(criminalRecordSystem.hasRole(criminalRecordSystem.REGISTRAR_ROLE(), registrar));
    }

    function testGetRecord() public {
        vm.prank(registrar);
        criminalRecordSystem.registerCriminal(testCriminal);

        vm.prank(registrar);
        criminalRecordSystem.addCrime(1, "Theft", "QmHashIPFS");

        // Fetch the record
        CriminalRecordSystem.CriminalRecord memory record = criminalRecordSystem.getRecord(1);

        // Assert the record
        assertEq(record.id, 1);
        assertEq(record.criminal, testCriminal);
        assertEq(record.crimeIds.length, 1);

        // Fetch the crime
        (uint256 crimeId, string memory description, string memory ipfsHash) = criminalRecordSystem.crimes(record.crimeIds[0]);

        // Assert the crime
        assertEq(crimeId, 1);
        assertEq(description, "Theft");
        assertEq(ipfsHash, "QmHashIPFS");
    }
}