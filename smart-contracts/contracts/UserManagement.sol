// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract UserManagement {
    event DoctorAccountAdded(address indexed userAddress, string email);
    event NurseAccountAdded(address indexed userAddress, string email);
    event StaffAccountAdded(address indexed userAddress, string email);
    event AdminAccountAdded(address indexed userAddress, string email);
    event UserAccountUpdated(address indexed userAddress, string email);
    event UsernameUpdated(address indexed userAddress, string email, string newUsername);
    event PhoneUpdated(address indexed userAddress, string email, string newPhone);
    event EmailUpdated(address indexed userAddress, string email, string newEmail);
    event AccountDeactivated(address indexed userAddress);

    struct UserAccount {uint id; address accountAddress; string username; string email; string role; string phone; uint createdAt; string cid; bool isActive;}

    UserAccount[] internal userAccounts;
    UserAccount[] internal patientAccounts;
    UserAccount[] internal doctorAccounts;
    UserAccount[] internal nurseAccounts;
    UserAccount[] internal staffAccounts;
    UserAccount[] internal adminAccounts;

    mapping(address => UserAccount) private userAccountsMap;
    mapping(string => address) private emailToAddressMap;
    uint private userAccountCounter = 1;
    uint private patientRecordCounter = 1;

    // POST Add New User Account
    function addUserAccount(string memory _username, string memory _email, string memory _role, string memory _phone, string memory _cid ) public {
        UserAccount memory newUserAccount = UserAccount( userAccountCounter, msg.sender, _username, _email, _role, _phone, block.timestamp, _cid, true);
        userAccounts.push(newUserAccount);
        userAccountsMap[msg.sender] = newUserAccount;
        emailToAddressMap[_email] = msg.sender;
        userAccountCounter++;
        if (keccak256(bytes(_role)) == keccak256(bytes("doctor"))) {
            doctorAccounts.push(newUserAccount);
            emit DoctorAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("nurse"))) {
            nurseAccounts.push(newUserAccount);
            emit NurseAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("staff"))) {
            staffAccounts.push(newUserAccount);
            emit StaffAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("admin"))) {
            adminAccounts.push(newUserAccount);
            emit AdminAccountAdded(msg.sender, _email);
        }
    }

    // POST Update Existing User Account
    function updateUserAccount(string memory _email, string memory _newUsername, string memory _newEmail, string memory _newPhone, string memory _newCid) public {
        require(emailToAddressMap[_email] != address(0), "!email_registered");
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "!owner");
        UserAccount storage account = userAccountsMap[userAddress];
        if (keccak256(bytes(_email)) != keccak256(bytes(_newEmail))) {
            require(emailToAddressMap[_newEmail] == address(0), "!email_available");
            emailToAddressMap[_newEmail] = userAddress;
            delete emailToAddressMap[_email];
        }
        account.username = _newUsername;
        account.email = _newEmail;
        account.phone = _newPhone;
        account.cid = _newCid;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == userAddress) {
                userAccounts[i].username = _newUsername;
                userAccounts[i].email = _newEmail;
                userAccounts[i].phone = _newPhone;
                userAccounts[i].cid = _newCid;
                break;
            }
        }
        emit UserAccountUpdated(userAddress, _newEmail);
    }

    // PATCH Delete/Deactivate User Account
    function deactivateAccount() public {
        require(emailToAddressMap[userAccountsMap[msg.sender].email] != address(0), "!exists");
        require(userAccountsMap[msg.sender].accountAddress == msg.sender, "Unauthorized.");
        userAccountsMap[msg.sender].isActive = false;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == msg.sender) { userAccounts[i].isActive = false; break; }
        }
        string memory role = userAccountsMap[msg.sender].role;
        if (keccak256(bytes(role)) == keccak256(bytes("patient"))) {
            updateRoleArrayStatus(patientAccounts, msg.sender);
        } else if (keccak256(bytes(role)) == keccak256(bytes("doctor"))) {
            updateRoleArrayStatus(doctorAccounts, msg.sender);
        } else if (keccak256(bytes(role)) == keccak256(bytes("nurse"))) {
            updateRoleArrayStatus(nurseAccounts, msg.sender);
        } else if (keccak256(bytes(role)) == keccak256(bytes("staff"))) {
            updateRoleArrayStatus(staffAccounts, msg.sender);
        } else if (keccak256(bytes(role)) == keccak256(bytes("admin"))) {
            updateRoleArrayStatus(adminAccounts, msg.sender);
        }
        emit AccountDeactivated(msg.sender);
    }

    // Helper function to update isActive status in role-specific array
    function updateRoleArrayStatus(UserAccount[] storage accounts, address userAddress ) private {
        for (uint i = 0; i < accounts.length; i++) {
            if (accounts[i].accountAddress == userAddress) { accounts[i].isActive = false; break; }
        }
    }

    // GET All Acounts
    function getAllAccounts() public view returns (UserAccount[] memory) { return userAccounts; }

    // GET All Active Accounts
    function getAllActiveAccounts() public view returns (UserAccount[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].isActive) { activeCount++; }
        }
        UserAccount[] memory activeAccounts = new UserAccount[](activeCount);
        uint j = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].isActive) { activeAccounts[j] = userAccounts[i]; j++; }
        }
        return activeAccounts;
    }

    // GET Account by Address
    function getAccountByAddress(address _address) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        return account;
    }

    // GET Account by Email
    function getAccountByEmail(string memory _email) public view returns (UserAccount memory) {
        address userAddress = emailToAddressMap[_email];
        UserAccount memory account = userAccountsMap[userAddress];
        return account;
    }

    // GET Accounts by Role (and only isActive == true)
    function getAccountsByRole(string memory role) public view returns (UserAccount[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked(role)) && userAccounts[i].isActive) activeCount++;
        }
        UserAccount[] memory activeAccounts = new UserAccount[](activeCount);
        uint index = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked(role)) && userAccounts[i].isActive) { activeAccounts[index] = userAccounts[i]; index++; }
        }
        return activeAccounts;
    }

    // GET Accounts by Role directly from Role Arrays
    function getAccountsByRoleInArray(string memory role) public view returns (UserAccount[] memory) {
        if (keccak256(bytes(role)) == keccak256(bytes("doctor"))) {
            return doctorAccounts;
        } else if (keccak256(bytes(role)) == keccak256(bytes("nurse"))) {
            return nurseAccounts;
        } else if (keccak256(bytes(role)) == keccak256(bytes("staff"))) {
            return staffAccounts;
        } else if (keccak256(bytes(role)) == keccak256(bytes("admin"))) {
            return adminAccounts;
        } else {
            revert("Invalid role");
        }
    }

    // GET Number of Account by Role
    function getNumberOfAccountsByRole(string memory role) public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (emailToAddressMap[userAccounts[i].email] != address(0) && keccak256(bytes(userAccounts[i].role)) == keccak256(bytes(role))) count++;
        }
        return count;
    }
}
