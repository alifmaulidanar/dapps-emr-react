// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
    event StaffAccountAdded(address indexed userAddress, string email);
    event NurseAccountAdded(address indexed userAddress, string email);
    event DoctorAccountAdded(address indexed userAddress, string email);
    event IpfsAccountAdded(address indexed ipfsAddress, string cid);
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
    event IpfsHashUpdated(
        address indexed userAddress,
        string email,
        address newIpfsHash
    );

    struct UserAccount {
        uint id;
        address accountAddress;
        string username;
        string email;
        string role;
        string phone;
        uint createdAt;
        address ipfsHash;
        bool isActive;
    }

    struct IpfsAccount {
        uint id;
        address ipfsAddress;
        string cid;
    }

    UserAccount[] public userAccounts;
    IpfsAccount[] public ipfsAccounts;

    mapping(address => UserAccount) userAccountsMap;
    mapping(string => address) emailToAddressMap;
    mapping(address => IpfsAccount) ipfsAccountMap;

    uint private userAccountCounter = 1;
    uint private ipfsAccountCounter = 1;

    // POST Add New User Account
    function addUserAccount(
        string memory _username,
        string memory _email,
        string memory _role,
        string memory _phone,
        address _ipfsHash
    ) public {
        UserAccount memory newUserAccount = UserAccount(
            userAccountCounter,
            msg.sender,
            _username,
            _email,
            _role,
            _phone,
            block.timestamp,
            _ipfsHash,
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

    // POST Add New IPFS
    function addIpfsAccount(string memory _cid) public {
        IpfsAccount memory newIpfsAccount = IpfsAccount(
            ipfsAccountCounter,
            msg.sender,
            _cid
        );
        ipfsAccounts.push(newIpfsAccount);
        ipfsAccountMap[msg.sender] = newIpfsAccount;
        ipfsAccountCounter++;
        emit IpfsAccountAdded(msg.sender, _cid);
    }

    // POST Update User Username
    function updateUserUsername(string memory _email, string memory _newUsername) public {
        require(
            emailToAddressMap[_email] != address(0),
            "Email not registered."
        );
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "Caller is not the account owner.");

        UserAccount storage account = userAccountsMap[userAddress];
        account.username = _newUsername;

        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == userAddress) {
                userAccounts[i].username = _newUsername;
                break;
            }
        }
        emit UsernameUpdated(userAddress, _email, _newUsername);
    }

    // POST Update User Phone
    function updateUserPhone(string memory _email, string memory _newPhone) public {
        require(
            emailToAddressMap[_email] != address(0),
            "Email not registered."
        );
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "Caller is not the account owner.");

        UserAccount storage account = userAccountsMap[userAddress];
        account.phone = _newPhone;

        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == userAddress) {
                userAccounts[i].phone = _newPhone;
                break;
            }
        }
        emit UsernameUpdated(userAddress, _email, _newPhone);
    }

    // POST Update User Email
    function updateUserEmail(string memory _oldEmail, string memory _newEmail) public {
        require(emailToAddressMap[_oldEmail] == msg.sender, "Caller is not the account owner.");
        require(emailToAddressMap[_newEmail] == address(0), "New email is already in use");

        UserAccount storage oldAccount = userAccountsMap[msg.sender];
        require(oldAccount.isActive, "Account is not active");
        oldAccount.isActive = false;
        delete emailToAddressMap[_oldEmail];

        UserAccount memory newAccount = UserAccount(
            oldAccount.id,
            msg.sender,
            oldAccount.username,
            _newEmail,
            oldAccount.role,
            oldAccount.phone,
            oldAccount.createdAt,
            oldAccount.ipfsHash,
            true
        );

        for(uint i = 0; i < userAccounts.length; i++) {
            if(userAccounts[i].accountAddress == msg.sender) {
                userAccounts[i] = newAccount;
                break;
            }
        }

        userAccountsMap[msg.sender] = newAccount;
        emailToAddressMap[_newEmail] = msg.sender;
        emit EmailUpdated(msg.sender, _oldEmail, _newEmail);
    }

    // POST Update IPFS Hash
    function updateIpfsHash(string memory _email, address _newIpfsHash) public {
        require(
            emailToAddressMap[_email] != address(0),
            "Email not registered."
        );
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "Caller is not the account owner.");

        // Update ipfsHash di UserAccount mapping
        UserAccount storage account = userAccountsMap[userAddress];
        account.ipfsHash = _newIpfsHash;

        // Update ipfsHash di UserAccount array
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == userAddress) {
                userAccounts[i].ipfsHash = _newIpfsHash;
                break;
            }
        }
        emit IpfsHashUpdated(userAddress, _email, _newIpfsHash);
    }

    // GET All Acounts
    function getAllAccounts() public view returns (UserAccount[] memory) {
        return userAccounts;
    }

    // GET Accounts by Role
    function getAccountsByRole(
        string memory role
    ) public view returns (UserAccount[] memory) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked(role)) &&
                emailToAddressMap[userAccounts[i].email] != address(0)
            ) {
                count++;
            }
        }

        UserAccount[] memory activeAccounts = new UserAccount[](count);
        uint index = 0;

        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked(role)) &&
                emailToAddressMap[userAccounts[i].email] != address(0)
            ) {
                activeAccounts[index] = userAccounts[i];
                index++;
            }
        }
        return activeAccounts;
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

    // GET Account by Address
    function getAccountByAddress(
        address _address
    ) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        // require(account.accountAddress != address(0), "Account does not exist");
        // require(account.isActive, "Account is not active");
        return account;
    }

    // GET All IPFS
    function getIpfs() public view returns (IpfsAccount[] memory) {
        return ipfsAccounts;
    }

    // GET IPFS by Address
    function getIpfsByAddress(
        address _address
    ) public view returns (IpfsAccount memory) {
        return ipfsAccountMap[_address];
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

    // GET Number of IPFS
    function getNumberOfIpfs() public view returns (uint) {
        return ipfsAccounts.length;
    }
}
