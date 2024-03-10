// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
    event StaffAccountAdded(address indexed userAddress, string email);
    event NurseAccountAdded(address indexed userAddress, string email);
    event DoctorAccountAdded(address indexed userAddress, string email);
    event UserAccountUpdated(address indexed userAddress, string email);
    event UsernameUpdated(
        address indexed userAddress,
        string email,
        string newUsername
    );
    event PhoneUpdated(
        address indexed userAddress,
        string email,
        string newPhone
    );
    event EmailUpdated(
        address indexed userAddress,
        string email,
        string newEmail
    );
    event AccountDeactivated(address indexed userAddress);

    struct UserAccount {
        uint id;
        address accountAddress;
        string username;
        string email;
        string role;
        string phone;
        uint createdAt;
        string cid;
        bool isActive;
    }

    UserAccount[] public userAccounts;

    mapping(address => UserAccount) userAccountsMap;
    mapping(string => address) emailToAddressMap;

    uint private userAccountCounter = 1;

    // POST Add New User Account
    function addUserAccount(
        string memory _username,
        string memory _email,
        string memory _role,
        string memory _phone,
        string memory _cid
    ) public {
        UserAccount memory newUserAccount = UserAccount(
            userAccountCounter,
            msg.sender,
            _username,
            _email,
            _role,
            _phone,
            block.timestamp,
            _cid,
            true
        );
        userAccounts.push(newUserAccount);
        userAccountsMap[msg.sender] = newUserAccount;
        emailToAddressMap[_email] = msg.sender;
        userAccountCounter++;

        if (keccak256(bytes(_role)) == keccak256(bytes("patient"))) {
            emit PatientAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("staff"))) {
            emit StaffAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("nurse"))) {
            emit NurseAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("doctor"))) {
            emit DoctorAccountAdded(msg.sender, _email);
        }
    }

    // POST Update Existing User Account
    function updateUserAccount(
        string memory _email,
        string memory _newUsername,
        string memory _newEmail,
        string memory _newPhone,
        string memory _newCid
    ) public {
        require(
            emailToAddressMap[_email] != address(0),
            "Email not registered."
        );
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "Caller is not the account owner.");

        // Retrieve and update the user account in the mapping
        UserAccount storage account = userAccountsMap[userAddress];

        // Check if email needs to be updated and handle the emailToAddressMap accordingly
        if (keccak256(bytes(_email)) != keccak256(bytes(_newEmail))) {
            require(
                emailToAddressMap[_newEmail] == address(0),
                "New email is already in use"
            );
            emailToAddressMap[_newEmail] = userAddress;
            delete emailToAddressMap[_email];
        }

        // Update account details
        account.username = _newUsername;
        account.email = _newEmail;
        account.phone = _newPhone;
        account.cid = _newCid;

        // Update the user account in the array
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
        require(
            emailToAddressMap[userAccountsMap[msg.sender].email] != address(0),
            "Account does not exist."
        );
        require(
            userAccountsMap[msg.sender].accountAddress == msg.sender,
            "Unauthorized."
        );

        // Update isActive status in the mapping
        userAccountsMap[msg.sender].isActive = false;

        // Find and update isActive status in the userAccounts array
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == msg.sender) {
                userAccounts[i].isActive = false;
                break; // Stop the loop once the account is found and updated
            }
        }
        emit AccountDeactivated(msg.sender);
    }

    // GET All Acounts
    function getAllAccounts() public view returns (UserAccount[] memory) {
        return userAccounts;
    }

    function getAllActiveAccounts() public view returns (UserAccount[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].isActive) {
                activeCount++;
            }
        }
        UserAccount[] memory activeAccounts = new UserAccount[](activeCount);
        uint j = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].isActive) {
                activeAccounts[j] = userAccounts[i];
                j++;
            }
        }
        return activeAccounts;
    }

    // GET Account by Address
    function getAccountByAddress(
        address _address
    ) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        // require(account.accountAddress != address(0), "Account does not exist");
        // require(account.isActive, "Account is not active");
        return account;
    }

    // GET Account by Email
    function getAccountByEmail(
        string memory _email
    ) public view returns (UserAccount memory) {
        address userAddress = emailToAddressMap[_email];
        UserAccount memory account = userAccountsMap[userAddress];
        // require(account.isActive, "Account is not active or does not exist");
        return account;
    }

    // GET Accounts by Role
    function getAccountsByRole(
        string memory role
    ) public view returns (UserAccount[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked(role)) &&
                userAccounts[i].isActive
            ) {
                activeCount++;
            }
        }
        UserAccount[] memory activeAccounts = new UserAccount[](activeCount);
        uint index = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked(role)) &&
                userAccounts[i].isActive
            ) {
                activeAccounts[index] = userAccounts[i];
                index++;
            }
        }
        return activeAccounts;
    }

    // GET Number of Account by Role
    function getNumberOfAccountsByRole(
        string memory role
    ) public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                emailToAddressMap[userAccounts[i].email] != address(0) &&
                keccak256(bytes(userAccounts[i].role)) == keccak256(bytes(role))
            ) {
                count++;
            }
        }
        return count;
    }
}
