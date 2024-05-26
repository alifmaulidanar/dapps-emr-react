// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;
// import "./UserManagement.sol";

contract PatientManagement {
    // Reference to UserManagement contract
    // UserManagement userManagement;
    // Constructor to set UserManagement contract address
    // constructor(address _userManagementAddress) {
    //     userManagement = UserManagement(_userManagementAddress);
    // }

    // Event when a new patient account is added
    event PatientAccountAdded(address indexed userAddress, string dmrNumber);
    event PatientAccountUpdated(address indexed userAddress, string newDmrNumber);

    // Structure to hold patient account information
    struct PatientAccount {
        uint id;
        address accountAddress;
        string role;
        uint createdAt;
        string dmrNumber;
        string dmrCid;
        bool isActive;
    }

    // Structure to hold individual patient medical records
    struct Patients {
        uint id;
        address accountAddress;
        string emrNumber;
        string idNumber;
    }

    // Arrays and mappings to manage patient accounts and records
    PatientAccount[] internal patientAccounts;
    Patients[] private patientRecords;
    mapping(address => PatientAccount) private patientAccountsMap;
    mapping(string => uint) private dmrNumberToAccountIdMap; // Mapping for dmrNumber to Account ID
    uint private patientRecordCounter = 1;

    // Function to add a new patient account
    function addPatientAccount(string memory _dmrNumber, string memory _dmrCid) public {
        require(dmrNumberToAccountIdMap[_dmrNumber] == 0, "DMR already exists");

        // Create a new patient account
        PatientAccount memory newPatientAccount = PatientAccount({
            id: patientAccounts.length + 1,
            accountAddress: msg.sender,
            role: "patient",
            createdAt: block.timestamp,
            dmrNumber: _dmrNumber,
            dmrCid: _dmrCid,
            isActive: true
        });

        // Add the new patient account to arrays and mappings
        patientAccounts.push(newPatientAccount);
        patientAccountsMap[msg.sender] = newPatientAccount;
        dmrNumberToAccountIdMap[_dmrNumber] = newPatientAccount.id;

        emit PatientAccountAdded(msg.sender, _dmrNumber);
    }

    // Function to update a patient account
    function updatePatientAccount(address _accountAddress, string memory _newDmrNumber, string memory _newDmrCid, bool _newIsActive) public returns (bool success) {
        if (patientAccountsMap[_accountAddress].accountAddress == address(0)) return false;
        PatientAccount storage account = patientAccountsMap[_accountAddress];
        uint accountId = account.id - 1; // Get the index in the array

        // Update dmrNumber if changed and ensure no duplicates
        if (keccak256(bytes(account.dmrNumber)) != keccak256(bytes(_newDmrNumber))) {
            if (dmrNumberToAccountIdMap[_newDmrNumber] != 0) return false;
            delete dmrNumberToAccountIdMap[account.dmrNumber];
            dmrNumberToAccountIdMap[_newDmrNumber] = account.id;
            account.dmrNumber = _newDmrNumber;
            patientAccounts[accountId].dmrNumber = _newDmrNumber; // Update array
        }

        // Update the other fields
        account.dmrCid = _newDmrCid;
        account.isActive = _newIsActive;
        patientAccounts[accountId].dmrCid = _newDmrCid; // Update array
        patientAccounts[accountId].isActive = _newIsActive; // Update array

        emit PatientAccountUpdated(_accountAddress, _newDmrNumber);
        return true;
    }

    // Function to get all patient accounts
    function getAllPatients() public view returns (PatientAccount[] memory) {
        return patientAccounts;
    }

    // Function to get a patient account by address
    function getPatientByAddress(address _address) public view returns (bool, PatientAccount memory) {
        if (patientAccountsMap[_address].accountAddress == address(0)) {
            return (false, PatientAccount(0, address(0), "", 0, "", "", false));
        }
        return (true, patientAccountsMap[_address]);
    }

    // Function to get a patient account by dmrNumber
    function getPatientByDmrNumber(string memory _dmrNumber) public view returns (bool, PatientAccount memory) {
        uint accountId = dmrNumberToAccountIdMap[_dmrNumber];
        if (accountId == 0) {
            return (false, PatientAccount(0, address(0), "", 0, "", "", false));
        }
        return (true, patientAccounts[accountId - 1]);
    }

    // Function to add a new patient medical record
    function addPatientRecord(address _accountAddress, string memory _emrNumber, string memory _idNumber) external {
        Patients memory newPatientRecord = Patients(patientRecordCounter, _accountAddress, _emrNumber, _idNumber);
        patientRecords.push(newPatientRecord);
        patientRecordCounter++;
    }

    // Function to get all patient medical records
    function getAllPatientRecords() external view returns (Patients[] memory) {
        return patientRecords;
    }
}
