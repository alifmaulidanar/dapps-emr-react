// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract OutpatientManagement {
    event OutpatientDataAdded(uint id, address owner, address doctor, address nurse, string cid);
    event OutpatientDataUpdated(uint id, address owner, address doctor, address nurse, string cid);
    event TemporaryPatientDataAdded(uint id, address staffAddress, address patientAddress, string emrNumber);

    struct AppointmentData {uint id; address owner; string cid;}
    struct TemporaryPatientData {uint id; address patientAddress; string emrNumber; uint addedAt;}

    mapping(address => uint[]) private appointmentsByPatient;
    mapping(address => uint[]) private appointmentsByDoctor;
    mapping(address => uint[]) private appointmentsByNurse;
    mapping(address => uint[]) private temporaryPatientDataByStaff;

    uint private appointmentCounter = 1;
    uint private temporaryPatientDataCounter = 1;
    AppointmentData[] private patientAppointments;
    AppointmentData[] private doctorAppointments;
    AppointmentData[] private nurseAppointments;
    TemporaryPatientData[] private temporaryPatientData;

    function addOutpatientData(address _patientAddress, address _doctorAddress, address _nurseAddress, string memory _cid) external {
        uint patientAppointmentId = appointmentCounter;
        uint doctorAppointmentId = appointmentCounter;
        uint nurseAppointmentId = appointmentCounter;
        appointmentCounter++;
        patientAppointments.push(AppointmentData(patientAppointmentId, _patientAddress, _cid));
        doctorAppointments.push(AppointmentData(doctorAppointmentId, _doctorAddress, _cid));
        nurseAppointments.push(AppointmentData(nurseAppointmentId, _nurseAddress, _cid));
        appointmentsByPatient[_patientAddress].push(patientAppointmentId);
        appointmentsByDoctor[_doctorAddress].push(doctorAppointmentId);
        appointmentsByNurse[_nurseAddress].push(nurseAppointmentId);
    }

    function updateOutpatientData(address _patientAddress, string memory _cid) external {
        require(appointmentsByPatient[_patientAddress].length > 0, "Appointments:404");
        for (uint i = 0; i < appointmentsByPatient[_patientAddress].length; i++) {
            uint appointmentId = appointmentsByPatient[_patientAddress][i];
            AppointmentData storage patientAppointment = patientAppointments[appointmentId - 1];
            AppointmentData storage doctorAppointment = doctorAppointments[appointmentId - 1];
            AppointmentData storage nurseAppointment = nurseAppointments[appointmentId - 1];
            patientAppointment.cid = _cid;
            doctorAppointment.cid = _cid;
            nurseAppointment.cid = _cid;
            emit OutpatientDataUpdated(appointmentId, _patientAddress, doctorAppointment.owner, nurseAppointment.owner, _cid);
        }
    }

    function getAllAppointments() external view returns (AppointmentData[] memory, AppointmentData[] memory, AppointmentData[] memory) {
        return (patientAppointments, doctorAppointments, nurseAppointments);
    }

    function getAppointmentsByPatient(address _patientAddress) external view returns (AppointmentData[] memory) {
        uint[] memory appointmentIds = appointmentsByPatient[_patientAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) appointments[i] = patientAppointments[appointmentIds[i] - 1];
        return appointments;
    }

    function getAppointmentsByDoctor(address _doctorAddress) external view returns (AppointmentData[] memory) {
        uint[] memory appointmentIds = appointmentsByDoctor[_doctorAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) appointments[i] = doctorAppointments[appointmentIds[i] - 1];
        return appointments;
    }

    function getAppointmentsByNurse(address _nurseAddress) external view returns (AppointmentData[] memory) {
        uint[] memory appointmentIds = appointmentsByNurse[_nurseAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) appointments[i] = nurseAppointments[appointmentIds[i] - 1];
        return appointments;
    }

    function addTemporaryPatientData(address _staffAddress, address _patientAddress, string memory _emrNumber) external {
        TemporaryPatientData memory newTemporaryPatientData = TemporaryPatientData( temporaryPatientDataCounter, _patientAddress, _emrNumber, block.timestamp);
        temporaryPatientData.push(newTemporaryPatientData);
        temporaryPatientDataByStaff[_staffAddress].push(temporaryPatientDataCounter);
        temporaryPatientDataCounter++;
        emit TemporaryPatientDataAdded(newTemporaryPatientData.id, _staffAddress, _patientAddress, _emrNumber);
    }

    function removeTemporaryPatientDataByPatientAddress(address _patientAddress) external {
        address staffAddress = msg.sender;
        uint[] storage dataIds = temporaryPatientDataByStaff[staffAddress];
        for (uint i = 0; i < dataIds.length; i++) {
            uint dataId = dataIds[i];
            if (temporaryPatientData[dataId - 1].patientAddress == _patientAddress) {
                delete temporaryPatientData[dataId - 1];
                dataIds[i] = dataIds[dataIds.length - 1];
                dataIds.pop();
                break;
            }
        }
    }

    function getTemporaryPatientDataByStaff(address _staffAddress) external view returns (TemporaryPatientData[] memory) {
        uint[] memory dataIds = temporaryPatientDataByStaff[_staffAddress];
        TemporaryPatientData[] memory data = new TemporaryPatientData[](dataIds.length);
        for (uint i = 0; i < dataIds.length; i++) {
            for (uint j = 0; j < temporaryPatientData.length; j++) {
                if (temporaryPatientData[j].id == dataIds[i]) { data[i] = temporaryPatientData[j]; break; }
            }
        }
        return data;
    }
}
