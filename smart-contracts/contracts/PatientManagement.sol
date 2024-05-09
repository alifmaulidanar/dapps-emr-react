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
    event PatientAccountAdded(address indexed userAddress, string nik, string dmrNumber);
    event PatientAccountUpdated(address indexed userAddress, string newNik, string newDmrNumber);

    // Structure to hold patient account information
    struct PatientAccount {
        uint id;
        address accountAddress;
        string username;
        string nik;
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
    mapping(string => uint) private nikToAccountIdMap; // Mapping for NIK to Account ID
    mapping(string => uint) private dmrNumberToAccountIdMap; // Mapping for dmrNumber to Account ID
    uint private patientRecordCounter = 1;

    // Function to add a new patient account
    function addPatientAccount(string memory _username, string memory _nik, string memory _dmrNumber, string memory _dmrCid) public {
        require(nikToAccountIdMap[_nik] == 0, "NIK already exists");

        // Create a new patient account
        PatientAccount memory newPatientAccount = PatientAccount({
            id: patientAccounts.length + 1,
            accountAddress: msg.sender,
            username: _username,
            nik: _nik,
            role: "patient",
            createdAt: block.timestamp,
            dmrNumber: _dmrNumber,
            dmrCid: _dmrCid,
            isActive: true
        });

        // Add the new patient account to arrays and mappings
        patientAccounts.push(newPatientAccount);
        patientAccountsMap[msg.sender] = newPatientAccount;
        nikToAccountIdMap[_nik] = newPatientAccount.id;
        dmrNumberToAccountIdMap[_dmrNumber] = newPatientAccount.id;

        emit PatientAccountAdded(msg.sender, _nik, _dmrNumber);
    }

    // Function to update a patient account
    function updatePatientAccount(address _accountAddress, string memory _newUsername, string memory _newNik, string memory _newDmrNumber, string memory _newDmrCid, bool _newIsActive) public returns (bool success) {
        if (patientAccountsMap[_accountAddress].accountAddress == address(0)) return false;
        PatientAccount storage account = patientAccountsMap[_accountAddress];
        
        // Update NIK if changed and ensure no duplicates
        if (keccak256(bytes(account.nik)) != keccak256(bytes(_newNik))) {
            if (nikToAccountIdMap[_newNik] != 0) return false;
            delete nikToAccountIdMap[account.nik];
            nikToAccountIdMap[_newNik] = account.id;
            account.nik = _newNik;
        }

        // Update dmrNumber if changed and ensure no duplicates
        if (keccak256(bytes(account.dmrNumber)) != keccak256(bytes(_newDmrNumber))) {
            if (dmrNumberToAccountIdMap[_newDmrNumber] != 0) return false;
            delete dmrNumberToAccountIdMap[account.dmrNumber];
            dmrNumberToAccountIdMap[_newDmrNumber] = account.id;
            account.dmrNumber = _newDmrNumber;
        }

        // Update the other fields
        account.username = _newUsername;
        account.dmrCid = _newDmrCid;
        account.isActive = _newIsActive;

        emit PatientAccountUpdated(_accountAddress, _newNik, _newDmrNumber);
        return true;
    }

    // Function to get all patient accounts
    function getAllPatients() public view returns (PatientAccount[] memory) {
        return patientAccounts;
    }

    // Function to get a patient account by address
    function getPatientByAddress(address _address) public view returns (bool, PatientAccount memory) {
        if (patientAccountsMap[_address].accountAddress == address(0)) {
            return (false, PatientAccount(0, address(0), "", "", "", 0, "", "", false));
        }
        return (true, patientAccountsMap[_address]);
    }

    // Function to get a patient account by NIK
    function getPatientByNik(string memory _nik) public view returns (bool, PatientAccount memory) {
        uint accountId = nikToAccountIdMap[_nik];
        if (accountId == 0) {
            return (false, PatientAccount(0, address(0), "", "", "", 0, "", "", false));
        }
        return (true, patientAccounts[accountId - 1]);
    }

    // Function to get a patient account by dmrNumber
    function getPatientByDmrNumber(string memory _dmrNumber) public view returns (bool, PatientAccount memory) {
        uint accountId = dmrNumberToAccountIdMap[_dmrNumber];
        if (accountId == 0) {
            return (false, PatientAccount(0, address(0), "", "", "", 0, "", "", false));
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
