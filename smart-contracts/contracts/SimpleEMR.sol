// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
    event DoctorAccountAdded(address indexed userAddress, string email);
    event IpfsAccountAdded(address indexed ipfsAddress, string cid);
    event EmailUpdated(
        address indexed userAddress,
        string email,
        string newEmail
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

    // Fungsi addUserAccount tidak bisa digunakan untuk update email di blockchain karena masih dapat mengakses akun melalui email lama
    // Solusinya, buat fungsi baru untuk memperbarui email sekaligus tambahkan field isActive = true
    // sebelum membuat menyimpan akun user dengan email baru tersebut, simpan dulu akun email user lama dengan isActive = false
    // Pada setiap pengambilan data dari blockchain harus validasi isActive = true
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

        // Emit event sesuai dengan role
        if (keccak256(bytes(_role)) == keccak256(bytes("patient"))) {
            emit PatientAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("doctor"))) {
            emit DoctorAccountAdded(msg.sender, _email);
        }
    }

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

    function getIpfs() public view returns (IpfsAccount[] memory) {
        return ipfsAccounts;
    }

    function getIpfsByAddress(
        address _address
    ) public view returns (IpfsAccount memory) {
        return ipfsAccountMap[_address];
    }

    function getNumberOfIpfs() public view returns (uint) {
        return ipfsAccounts.length;
    }

    function getPatientAccounts() public view returns (UserAccount[] memory) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("patient"))
            ) {
                count++;
            }
        }

        UserAccount[] memory patients = new UserAccount[](count);
        uint index = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("patient"))
            ) {
                patients[index] = userAccounts[i];
                index++;
            }
        }
        return patients;
    }

    function getDoctorAccounts() public view returns (UserAccount[] memory) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("doctor"))
            ) {
                count++;
            }
        }

        UserAccount[] memory doctors = new UserAccount[](count);
        uint index = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("doctor"))
            ) {
                doctors[index] = userAccounts[i];
                index++;
            }
        }
        return doctors;
    }

    function getUserAccountByEmail(
        string memory _email
    ) public view returns (UserAccount memory) {
        address userAddress = emailToAddressMap[_email];
        UserAccount memory account = userAccountsMap[userAddress];
        // require(account.isActive, "Account is not active or does not exist");
        return account;
    }

    function getUserAccountByAddress(
        address _address
    ) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        // require(account.accountAddress != address(0), "Account does not exist");
        // require(account.isActive, "Account is not active");
        return account;
    }

    function getNumberOfPatientAccounts() public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("patient"))
            ) {
                count++;
            }
        }
        return count;
    }

    function getNumberOfDoctorAccounts() public view returns (uint) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(bytes(userAccounts[i].role)) ==
                keccak256(bytes("doctor"))
            ) {
                count++;
            }
        }
        return count;
    }
}
