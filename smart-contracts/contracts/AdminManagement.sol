// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract AdminManagement {
    event AdminAdded(uint id, address adminAddress, string username);
    struct Admin {uint id; address adminAddress; string username; string password;}

    Admin[] private admins;
    mapping(address => uint) private adminMap;
    constructor() {
        addAdmin(msg.sender, "admin1234", "$2a$10$boCU2CG2uF6dOsS1EDiFr.gizftTaskir9sBB/wC2zXyX/etbTzdq");
    }

    function addAdmin(address _adminAddress, string memory _username, string memory _password) private {
        uint id = admins.length + 1;
        admins.push(Admin(id, _adminAddress, _username, _password));
        adminMap[_adminAddress] = id;
        emit AdminAdded(id, _adminAddress, _username);
    }

    function getAllAdmins() external view returns (Admin[] memory) { return admins;}

    function getAdminByAddress(address _adminAddress) external view returns (Admin memory) {
        require(adminMap[_adminAddress] != 0, "Admin does not exist.");
        return admins[adminMap[_adminAddress] - 1];
    }
}