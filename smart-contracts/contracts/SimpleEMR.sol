// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract SimpleEMR {
    event PatientAdded(address indexed patientAddress, string email);
    event IpfsAdded(address indexed patientAddress, string cid);

    struct PatientAccount {
        uint accountId;
        address accountAddress;
        string email;
        string role;
        address ipfsHash;
    }

    struct Ipfs {
        uint ipfsId;
        address ipfsAddress;
        string cid;
    }

    PatientAccount[] public patientAccounts;
    Ipfs[] public ipfss;

    mapping(address => PatientAccount) accountsMap;
    mapping(string => address) public emailToAddress;
    mapping(address => Ipfs) ipfsMap;

    uint private patientAccountCounter = 1;
    uint private ipfsCounter = 1;

    function addPatientAccount(
        string memory _email,
        string memory _role,
        address _ipfsHash
    ) public {
        PatientAccount memory patientAccount = PatientAccount(
            patientAccountCounter,
            msg.sender,
            _email,
            _role,
            _ipfsHash
        );
        patientAccounts.push(patientAccount);
        accountsMap[msg.sender] = patientAccount;
        emailToAddress[_email] = msg.sender;
        patientAccountCounter++;

        emit PatientAdded(msg.sender, _email);
    }

    function getPatientAccount() public view returns (PatientAccount[] memory) {
        return patientAccounts;
    }

    function getPatientAccountByEmail(
        string memory _email
    ) public view returns (address) {
        return emailToAddress[_email];
    }

    function getPatientAccountByAddress(
        address _address
    ) public view returns (PatientAccount memory) {
        return accountsMap[_address];
    }

    function addIpfs(string memory _cid) public {
        Ipfs memory ipfs = Ipfs(ipfsCounter, msg.sender, _cid);
        ipfss.push(ipfs);
        ipfsMap[msg.sender] = ipfs;
        ipfsCounter++;

        emit IpfsAdded(msg.sender, _cid);
    }

    function getIpfs() public view returns (Ipfs[] memory) {
        return ipfss;
    }

    function getIpfsByAddress(
        address _address
    ) public view returns (Ipfs memory) {
        return ipfsMap[_address];
    }
}
