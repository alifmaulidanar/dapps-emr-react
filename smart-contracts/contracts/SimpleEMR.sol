// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
    event StaffAccountAdded(address indexed userAddress, string email);
    event NurseAccountAdded(address indexed userAddress, string email);
    event DoctorAccountAdded(address indexed userAddress, string email);
    event IpfsAccountAdded(address indexed ipfsAddress, string cid);
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
        string email;
        string role;
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
        string memory _email,
        string memory _role,
        address _ipfsHash
    ) public {
        UserAccount memory newUserAccount = UserAccount(
            userAccountCounter,
            msg.sender,
            _email,
            _role,
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

    // POST Update User Email
    function updateUserEmail(string memory _newEmail) public {
        UserAccount storage userAccount = userAccountsMap[msg.sender];
        require(userAccount.accountAddress != address(0), "Account not found");
        require(userAccount.isActive, "Account is not active");
        require(
            emailToAddressMap[_newEmail] == address(0),
            "Email is already in use"
        );

        // Deactivate current account & delete email mapping
        userAccount.isActive = false;
        delete emailToAddressMap[userAccount.email];

        addUserAccount(_newEmail, userAccount.role, userAccount.ipfsHash);
        emailToAddressMap[_newEmail] = msg.sender;
        emit EmailUpdated(msg.sender, userAccount.email, _newEmail);
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
