// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import "../../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract CriminalRecordSystem is AccessControl, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VIEWER_ROLE = keccak256("VIEWER_ROLE");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    struct User {
        address account;
        bytes32 passwordHash;
        bytes32 role;
    }

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

    mapping(string => User) public users;
    mapping(uint256 => CriminalRecord) public records;
    mapping(uint256 => Crime) public crimes;
    mapping(address => PoliceAuthority) public policeAuthorities;
    mapping(address => bool) public registeredCriminals;
    mapping(string => bool) private crimeHashes;
    mapping(uint256 => bool) public deactivatedRecords;

    event DebugLog(string message);
    event RoleGranted(bytes32 role, address account);
    event UserRegistered(string username, address account, bytes32 role);
    event CriminalRegistered(uint256 indexed id, address indexed criminal);
    event CrimeAdded(uint256 indexed crimeId, uint256 indexed recordId, string ipfsHash);
    event CriminalRecordUpdated(uint256 indexed recordId, address newCriminal);
    event CriminalRecordDeactivated(uint256 indexed recordId);
    event PoliceAuthorityAdded(address indexed authorityAddress, string name, string badgeNumber);
    event PoliceAuthorityStatusChanged(address indexed authorityAddress, bool isActive);
    
    event DebugLog(string message, address sender, bytes32 role, bool success);
constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(REGISTRAR_ROLE, msg.sender); // Add registrar role to deployer
        _setRoleAdmin(VIEWER_ROLE, ADMIN_ROLE);
        
        emit DebugLog("Contract deployed and roles initialized");
        emit RoleGranted(ADMIN_ROLE, msg.sender);
        emit RoleGranted(REGISTRAR_ROLE, msg.sender);
    }
function registerUser(
        string memory username,
        string memory password,
        bytes32 role
    ) external onlyRole(REGISTRAR_ROLE) {
        require(users[username].account == address(0), "Username taken");
        require(role == VIEWER_ROLE || role == EDITOR_ROLE, "Invalid role");

        users[username] = User({
            account: msg.sender,
            passwordHash: keccak256(abi.encodePacked(password)),
            role: role
        });

        _grantRole(role, msg.sender);
        emit UserRegistered(username, msg.sender, role);
        emit DebugLog(string(abi.encodePacked("User registered: ", username)));
    }

    function assignRegistrarRole(address registrar) public onlyRole(ADMIN_ROLE) {
        require(registrar != address(0), "Invalid registrar address");
        grantRole(REGISTRAR_ROLE, registrar);
        emit DebugLog("Registrar role assigned", registrar, REGISTRAR_ROLE, true);
    }

    function registerCriminal(address _criminal) public onlyRole(REGISTRAR_ROLE) nonReentrant {
        emit DebugLog("Registering criminal", msg.sender, REGISTRAR_ROLE, true);

        require(_criminal != address(0), "Invalid criminal address");
        require(!registeredCriminals[_criminal], "Criminal already registered");

        _recordIdCounter++;

       records[_recordIdCounter] = CriminalRecord({
    id: _recordIdCounter,
    crimeIds: new uint256[](0) ,  // ✅ Initialize the array with new keyword
    criminal: _criminal          // ✅ Ensure a comma before this line
});


        registeredCriminals[_criminal] = true;
        emit CriminalRegistered(_recordIdCounter, _criminal);
        emit DebugLog("Criminal registered successfully", msg.sender, REGISTRAR_ROLE, true);
    }

    function addCrime(uint256 _recordId, string memory _description, string memory _ipfsHash)
        public onlyRole(REGISTRAR_ROLE) nonReentrant {
        emit DebugLog("Adding crime", msg.sender, REGISTRAR_ROLE, true);

        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(!crimeHashes[_ipfsHash], "Crime already recorded");
        require(bytes(_description).length > 0, "Crime description required");

        _crimeIdCounter++;
        crimes[_crimeIdCounter] = Crime(_crimeIdCounter, _description, _ipfsHash);
        records[_recordId].crimeIds.push(_crimeIdCounter);
        crimeHashes[_ipfsHash] = true;

        emit CrimeAdded(_crimeIdCounter, _recordId, _ipfsHash);
        emit DebugLog("Crime added successfully", msg.sender, REGISTRAR_ROLE, true);
    }

    function getRecord(uint256 _recordId) public view returns (CriminalRecord memory) {
        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        return records[_recordId];
    }

    function updateCriminal(uint256 _recordId, address _newCriminal) public onlyRole(EDITOR_ROLE) {
        emit DebugLog("Updating criminal", msg.sender, EDITOR_ROLE, true);

        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(_newCriminal != address(0), "Invalid criminal address");

        records[_recordId].criminal = _newCriminal;
        emit CriminalRecordUpdated(_recordId, _newCriminal);
        emit DebugLog("Criminal updated successfully", msg.sender, EDITOR_ROLE, true);
    }

    function deactivateRecord(uint256 _recordId) public onlyRole(EDITOR_ROLE) {
        emit DebugLog("Deactivating record", msg.sender, EDITOR_ROLE, true);

        require(_recordId > 0 && _recordId <= _recordIdCounter, "Invalid record ID");
        require(!deactivatedRecords[_recordId], "Record already deactivated");

        deactivatedRecords[_recordId] = true;
        emit CriminalRecordDeactivated(_recordId);
        emit DebugLog("Record deactivated successfully", msg.sender, EDITOR_ROLE, true);
    }

function addPoliceAuthority(address _authority, string memory _name, string memory _badgeNumber)
        public onlyRole(ADMIN_ROLE) {
        emit DebugLog("Adding police authority");
        
        require(_authority != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_badgeNumber).length > 0, "Badge number required");

        policeAuthorities[_authority] = PoliceAuthority(_authority, _name, _badgeNumber, true);
        grantRole(REGISTRAR_ROLE, _authority);
        
        emit DebugLog("Police authority added");
        emit PoliceAuthorityAdded(_authority, _name, _badgeNumber);
    }

    function changePoliceAuthorityStatus(address _authority, bool _isActive) public onlyRole(ADMIN_ROLE) {
        emit DebugLog("Changing police authority status", msg.sender, ADMIN_ROLE, true);

        require(policeAuthorities[_authority].authorityAddress != address(0), "Authority does not exist");

        policeAuthorities[_authority].isActive = _isActive;
        if (_isActive) {
            grantRole(REGISTRAR_ROLE, _authority);
        } else {
            revokeRole(REGISTRAR_ROLE, _authority);
        }
        emit PoliceAuthorityStatusChanged(_authority, _isActive);
        emit DebugLog("Police authority status changed", msg.sender, ADMIN_ROLE, true);
    }
}
