// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
    event DoctorAccountAdded(address indexed userAddress, string email);
    event IpfsAccountAdded(address indexed ipfsAddress, string cid);

    struct UserAccount {
        uint id;
        address accountAddress;
        string email;
        string role;
        address ipfsHash;
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
            _ipfsHash
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
        if (userAddress == address(0)) {
            return
                UserAccount({
                    id: 0,
                    accountAddress: address(0),
                    email: "",
                    role: "",
                    ipfsHash: address(0)
                });
        }
        return userAccountsMap[userAddress];
    }

    function getUserAccountByAddress(
        address _address
    ) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        if (account.accountAddress == address(0)) {
            return
                UserAccount({
                    id: 0,
                    accountAddress: address(0),
                    email: "",
                    role: "",
                    ipfsHash: address(0)
                });
        }
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
