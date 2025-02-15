// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CriminalRecordSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VIEWER_ROLE = keccak256("VIEWER_ROLE");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    struct CriminalRecord {
        uint256 id;
        uint256[] crimeIds;
        address criminal;
    }

    struct Crime {
        uint256 id;
        string description;
        string ipfsHash;
    }

    struct PoliceAuthority {
        address authorityAddress;
        string name;
        string badgeNumber;
        bool isActive;
    }

    uint256 private _recordIdCounter;
    uint256 private _crimeIdCounter;

    mapping(uint256 => CriminalRecord) public records;
    mapping(uint256 => Crime) public crimes;
    mapping(address => PoliceAuthority) public policeAuthorities;
    mapping(address => bool) public registeredCriminals;
    mapping(string => bool) private crimeHashes;
    mapping(uint256 => bool) public deactivatedRecords;

    event CriminalRegistered(uint256 indexed id, address indexed criminal);
    event CrimeAdded(uint256 indexed crimeId, uint256 indexed recordId, string ipfsHash);
    event CriminalRecordUpdated(uint256 indexed recordId, address newCriminal);
    event CriminalRecordDeactivated(uint256 indexed recordId);
    event PoliceAuthorityAdded(address indexed authorityAddress, string name, string badgeNumber);
    event PoliceAuthorityStatusChanged(address indexed authorityAddress, bool isActive);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Assign DEFAULT_ADMIN_ROLE to the deployer
    }

 function assignRegistrarRole(address registrar) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin"); // Extra check
    grantRole(REGISTRAR_ROLE, registrar);
}


    function registerCriminal(address _criminal) public onlyRole(REGISTRAR_ROLE) nonReentrant {
        require(!registeredCriminals[_criminal], "Criminal already registered");
        _recordIdCounter++;
        uint256 newRecordId = _recordIdCounter;

       
        CriminalRecord memory newRecord = CriminalRecord({
            id: newRecordId,
            crimeIds: new uint256[](0), // Initialize an empty array for crimeIds
            criminal: _criminal
        });

        // Assign the struct to the records mapping
        records[newRecordId] = newRecord;

        // Mark the criminal as registered
        registeredCriminals[_criminal] = true;

        emit CriminalRegistered(newRecordId, _criminal);
    }

    function addCrime(uint256 _recordId, string memory _description, string memory _ipfsHash) 
        public onlyRole(REGISTRAR_ROLE) nonReentrant {
        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(!crimeHashes[_ipfsHash], "Crime already recorded");

        _crimeIdCounter++;
        uint256 newCrimeId = _crimeIdCounter;
        crimes[newCrimeId] = Crime(newCrimeId, _description, _ipfsHash);
        records[_recordId].crimeIds.push(newCrimeId);
        crimeHashes[_ipfsHash] = true;

        emit CrimeAdded(newCrimeId, _recordId, _ipfsHash);
    }

    function getRecord(uint256 _recordId) public view returns (CriminalRecord memory) {
        return records[_recordId]; // Return the entire struct
    }

    function updateCriminal(uint256 _recordId, address _newCriminal) public onlyRole(EDITOR_ROLE) {
        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(_newCriminal != address(0), "Invalid criminal address");

        records[_recordId].criminal = _newCriminal;
        emit CriminalRecordUpdated(_recordId, _newCriminal);
    }

    function deactivateRecord(uint256 _recordId) public onlyRole(EDITOR_ROLE) {
        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(!deactivatedRecords[_recordId], "Record already deactivated");

        deactivatedRecords[_recordId] = true;
        emit CriminalRecordDeactivated(_recordId);
    }

    function addPoliceAuthority(address _authority, string memory _name, string memory _badgeNumber) 
        public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_authority != address(0), "Invalid address");

        policeAuthorities[_authority] = PoliceAuthority(_authority, _name, _badgeNumber, true);
        grantRole(REGISTRAR_ROLE, _authority); // Enforce access control checks
    }

    function changePoliceAuthorityStatus(address _authority, bool _isActive) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(policeAuthorities[_authority].authorityAddress != address(0), "Authority does not exist");

        policeAuthorities[_authority].isActive = _isActive;
        if (_isActive) {
            grantRole(REGISTRAR_ROLE, _authority); // Enforce access control checks
        } else {
            revokeRole(REGISTRAR_ROLE, _authority);
        }
    }
}