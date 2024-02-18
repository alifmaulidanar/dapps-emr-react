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
        } else if (keccak256(bytes(_role)) == keccak256(bytes("staff"))) {
            emit StaffAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("nurse"))) {
            emit NurseAccountAdded(msg.sender, _email);
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

    // get akun pasien dari mapping
    function getPatientAccounts() public view returns (UserAccount[] memory) {
        uint count = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked("patient")) &&
                emailToAddressMap[userAccounts[i].email] != address(0)
            ) {
                count++;
            }
        }

        UserAccount[] memory activePatients = new UserAccount[](count);
        uint index = 0;

        for (uint i = 0; i < userAccounts.length; i++) {
            if (
                keccak256(abi.encodePacked(userAccounts[i].role)) ==
                keccak256(abi.encodePacked("patient")) &&
                emailToAddressMap[userAccounts[i].email] != address(0)
            ) {
                activePatients[index] = userAccounts[i];
                index++;
            }
        }
        return activePatients;
    }

    // get akun petugas pendaftaran dari mapping
    // function getStaffAccounts() public view returns (UserAccount[] memory) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("staff")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             count++;
    //         }
    //     }

    //     UserAccount[] memory activeStaffs = new UserAccount[](count);
    //     uint index = 0;

    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("staff")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             activeStaffs[index] = userAccounts[i];
    //             index++;
    //         }
    //     }
    //     return activeStaffs;
    // }

    // get akun perawat dari mapping
    // function getNurseAccounts() public view returns (UserAccount[] memory) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("nurse")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             count++;
    //         }
    //     }

    //     UserAccount[] memory activeNurses = new UserAccount[](count);
    //     uint index = 0;

    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("nurse")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             activeNurses[index] = userAccounts[i];
    //             index++;
    //         }
    //     }
    //     return activeNurses;
    // }

    // get akun dokter dari mapping
    // function getDoctorAccounts() public view returns (UserAccount[] memory) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("doctor")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             count++;
    //         }
    //     }

    //     UserAccount[] memory activeDoctors = new UserAccount[](count);
    //     uint index = 0;

    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked("doctor")) && emailToAddressMap[userAccounts[i].email] != address(0)) {
    //             activeDoctors[index] = userAccounts[i];
    //             index++;
    //         }
    //     }
    //     return activeDoctors;
    // }

    function getAccountsByRole(
        string memory role
    ) public view returns (UserAccount[] memory) {
        // belum terpakai di backend
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

    function getAccountByEmail(
        string memory _email
    ) public view returns (UserAccount memory) {
        address userAddress = emailToAddressMap[_email];
        UserAccount memory account = userAccountsMap[userAddress];
        // require(account.isActive, "Account is not active or does not exist");
        return account;
    }

    function getAccountByAddress(
        address _address
    ) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        // require(account.accountAddress != address(0), "Account does not exist");
        // require(account.isActive, "Account is not active");
        return account;
    }

    // Fungsi untuk mendapatkan jumlah akun aktif berdasarkan role
    function getNumberOfAccountsByRole(
        string memory role
    ) public view returns (uint) {
        // belum terpakai di backend
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

    // get jumlah akun pasien yang aktif dari mapping
    // function getNumberOfPatientAccounts() public view returns (uint) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if(emailToAddressMap[userAccounts[i].email] != address(0) &&
    //         keccak256(bytes(userAccounts[i].role)) == keccak256(bytes("patient"))) {
    //             count++;
    //         }
    //     }
    //     return count;
    // }

    // get jumlah akun petugas pendaftaran yang aktif dari mapping
    // function getNumberOfStaffAccounts() public view returns (uint) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if(emailToAddressMap[userAccounts[i].email] != address(0) &&
    //         keccak256(bytes(userAccounts[i].role)) == keccak256(bytes("staff"))) {
    //             count++;
    //         }
    //     }
    //     return count;
    // }

    // get jumlah akun perawat yang aktif dari mapping
    // function getNumberOfNurseAccounts() public view returns (uint) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if(emailToAddressMap[userAccounts[i].email] != address(0) &&
    //         keccak256(bytes(userAccounts[i].role)) == keccak256(bytes("nurse"))) {
    //             count++;
    //         }
    //     }
    //     return count;
    // }

    // get jumlah akun dokter yang aktif dari mapping
    // function getNumberOfDoctorAccounts() public view returns (uint) {
    //     uint count = 0;
    //     for (uint i = 0; i < userAccounts.length; i++) {
    //         if(emailToAddressMap[userAccounts[i].email] != address(0) &&
    //         keccak256(bytes(userAccounts[i].role)) == keccak256(bytes("doctor"))) {
    //             count++;
    //         }
    //     }
    //     return count;
    // }
}
