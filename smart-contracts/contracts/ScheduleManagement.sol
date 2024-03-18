// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract ScheduleManagement {
    event ScheduleCreated(uint id, string cid, uint createdAt);
    event ScheduleUpdated(uint id, string cid, bool isActive);

    struct DoctorSchedule {uint id; string cid; uint createdAt; bool isActive;}
    DoctorSchedule[] private doctorSchedules;
    mapping(string => uint) private doctorSchedulesMap;
    uint private scheduleIdCounter = 1;

    // Add New Schedule
    function addDoctorSchedule(string memory _cid) external {
        doctorSchedules.push(DoctorSchedule(scheduleIdCounter, _cid, block.timestamp, true));
        doctorSchedulesMap[_cid] = scheduleIdCounter;
        emit ScheduleCreated(scheduleIdCounter, _cid, block.timestamp);
        scheduleIdCounter++;
    }

    // Update isActive Status
    function updateDoctorScheduleStatus(string memory _cid, bool _isActive) external {
        uint id = doctorSchedulesMap[_cid];
        require(id != 0, "schedule:404");
        DoctorSchedule storage schedule = doctorSchedules[id - 1];
        schedule.isActive = _isActive;
        emit ScheduleUpdated(id, _cid, _isActive);
    }

    // GET Schedule by CID
    function getDoctorScheduleByCID(string memory _cid) external view returns (DoctorSchedule memory) {
        uint id = doctorSchedulesMap[_cid];
        require(id != 0, "schedule:404");
        return doctorSchedules[id - 1];
    }

    // GET Latest Active Doctor Schedule
    function getLatestActiveDoctorSchedule() external view returns (DoctorSchedule memory) {
        for (uint i = doctorSchedules.length; i > 0; i--) {
            DoctorSchedule memory currentSchedule = doctorSchedules[i - 1];
            if (currentSchedule.isActive) return currentSchedule;
        }
        return DoctorSchedule(0, "", 0, false);
    }

    // GET All Active Schedules
    function getAllActiveDoctorSchedules() external view returns (DoctorSchedule[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < doctorSchedules.length; i++) {
            if (doctorSchedules[i].isActive) activeCount++;
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
}
