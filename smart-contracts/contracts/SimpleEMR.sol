// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract SimpleEMR {
    event PatientAccountAdded(address indexed userAddress, string email);
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
    struct DoctorSchedules {uint id; address doctorAddress;}

    UserAccount[] public userAccounts;
    UserAccount[] public patientAccounts;
    UserAccount[] public doctorAccounts;
    UserAccount[] public nurseAccounts;
    UserAccount[] public staffAccounts;
    UserAccount[] public adminAccounts;

    mapping(address => UserAccount) userAccountsMap;
    mapping(string => address) emailToAddressMap;

    uint private userAccountCounter = 1;

    // POST Add New User Account
    function addUserAccount(string memory _username, string memory _email, string memory _role, string memory _phone, string memory _cid ) public {
        UserAccount memory newUserAccount = UserAccount( userAccountCounter, msg.sender, _username, _email, _role, _phone, block.timestamp, _cid, true);
        userAccounts.push(newUserAccount);
        userAccountsMap[msg.sender] = newUserAccount;
        emailToAddressMap[_email] = msg.sender;
        userAccountCounter++;

        // Role segregation logic
        if (keccak256(bytes(_role)) == keccak256(bytes("patient"))) {
            patientAccounts.push(newUserAccount);
            emit PatientAccountAdded(msg.sender, _email);
        } else if (keccak256(bytes(_role)) == keccak256(bytes("doctor"))) {
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
        require(emailToAddressMap[_email] != address(0), "Email not registered.");
        address userAddress = emailToAddressMap[_email];
        require(userAddress == msg.sender, "Caller is not the account owner.");
        UserAccount storage account = userAccountsMap[userAddress];

        if (keccak256(bytes(_email)) != keccak256(bytes(_newEmail))) {
            require(emailToAddressMap[_newEmail] == address(0), "New email is already in use"
            );
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
        require(emailToAddressMap[userAccountsMap[msg.sender].email] != address(0), "Account does not exist.");
        require(userAccountsMap[msg.sender].accountAddress == msg.sender, "Unauthorized.");
        userAccountsMap[msg.sender].isActive = false;
        
        for (uint i = 0; i < userAccounts.length; i++) {
            if (userAccounts[i].accountAddress == msg.sender) {
                userAccounts[i].isActive = false;
                break;
            }
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
            if (accounts[i].accountAddress == userAddress) {
                accounts[i].isActive = false;
                break;
            }
        }
    }

    // GET All Acounts
    function getAllAccounts() public view returns (UserAccount[] memory) { return userAccounts; }

    // GET All Active Accounts
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
    function getAccountByAddress(address _address) public view returns (UserAccount memory) {
        UserAccount memory account = userAccountsMap[_address];
        // require(account.accountAddress != address(0), "Account does not exist");
        // require(account.isActive, "Account is not active");
        return account;
    }

    // GET Account by Email
    function getAccountByEmail(string memory _email) public view returns (UserAccount memory) {
        address userAddress = emailToAddressMap[_email];
        UserAccount memory account = userAccountsMap[userAddress];
        // require(account.isActive, "Account is not active or does not exist");
        return account;
    }

    // GET Accounts by Role (and only isActive == true)
    function getAccountsByRole(string memory role) public view returns (UserAccount[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked(role)) && userAccounts[i].isActive) {
                activeCount++;
            }
        }

        UserAccount[] memory activeAccounts = new UserAccount[](activeCount);
        uint index = 0;
        for (uint i = 0; i < userAccounts.length; i++) {
            if (keccak256(abi.encodePacked(userAccounts[i].role)) == keccak256(abi.encodePacked(role)) && userAccounts[i].isActive) {
                activeAccounts[index] = userAccounts[i];
                index++;
            }
        }
        return activeAccounts;
    }

    // GET Accounts by Role directly from Role Arrays
    function getAccountsByRoleInArray(string memory role) public view returns (UserAccount[] memory) {
        if (keccak256(bytes(role)) == keccak256(bytes("patient"))) {
            return patientAccounts;
        } else if (keccak256(bytes(role)) == keccak256(bytes("doctor"))) {
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
            if (emailToAddressMap[userAccounts[i].email] != address(0) && keccak256(bytes(userAccounts[i].role)) == keccak256(bytes(role))) {
                count++;
            }
        }
        return count;
    }

    // DOCTOR SCHEDULES //
    event ScheduleCreated(uint id, string cid, uint createdAt);
    event ScheduleUpdated(uint id, string cid, bool isActive);

    struct DoctorSchedule {uint id; string cid; uint createdAt; bool isActive;}
    DoctorSchedule[] public doctorSchedules;
    mapping(string => uint) public doctorSchedulesMap;
    uint private scheduleIdCounter = 1;

    // Add New Schedule
    function addDoctorSchedule(string memory _cid) public {
        doctorSchedules.push(DoctorSchedule(scheduleIdCounter, _cid, block.timestamp, true));
        doctorSchedulesMap[_cid] = scheduleIdCounter;
        emit ScheduleCreated(scheduleIdCounter, _cid, block.timestamp);
        scheduleIdCounter++;
    }

    // Update isActive Status
    function updateDoctorScheduleStatus(string memory _cid, bool _isActive) public {
        uint id = doctorSchedulesMap[_cid];
        require(id != 0, "Schedule not found.");
        DoctorSchedule storage schedule = doctorSchedules[id - 1];
        schedule.isActive = _isActive;
        emit ScheduleUpdated(id, _cid, _isActive);
    }

    // GET Schedule by CID
    function getDoctorScheduleByCID(string memory _cid) public view returns (DoctorSchedule memory) {
        uint id = doctorSchedulesMap[_cid];
        require(id != 0, "Schedule not found.");
        return doctorSchedules[id - 1];
    }

    // GET All Active Schedules
    function getAllActiveDoctorSchedules() public view returns (DoctorSchedule[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < doctorSchedules.length; i++) {
            if (doctorSchedules[i].isActive) {
                activeCount++;
            }
        }

        DoctorSchedule[] memory activeSchedules = new DoctorSchedule[](activeCount);
        uint currentIndex = 0;
        for (uint i = 0; i < doctorSchedules.length; i++) {
            if (doctorSchedules[i].isActive) {
                activeSchedules[currentIndex] = doctorSchedules[i];
                currentIndex++;
            }
        }
        return activeSchedules;
    }

    // ADMIN //
    event AdminAdded(uint id, address adminAddress, string username);
    struct Admin {uint id; address adminAddress; string username; string password;}

    Admin[] public admins;
    mapping(address => uint) public adminMap;
    constructor() {
        addAdmin(msg.sender, "admin1234", "$2a$10$boCU2CG2uF6dOsS1EDiFr.gizftTaskir9sBB/wC2zXyX/etbTzdq");
    }

    function addAdmin(address _adminAddress, string memory _username, string memory _password) internal {
        uint id = admins.length + 1;
        admins.push(Admin(id, _adminAddress, _username, _password));
        adminMap[_adminAddress] = id;
        emit AdminAdded(id, _adminAddress, _username);
    }

    function getAllAdmins() public view returns (Admin[] memory) { return admins;}
    function getAdminByAddress(address _adminAddress) public view returns (Admin memory) {
        require(adminMap[_adminAddress] != 0, "Admin does not exist.");
        return admins[adminMap[_adminAddress] - 1];
    }
}
