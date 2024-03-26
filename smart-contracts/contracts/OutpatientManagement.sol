// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract OutpatientManagement {
    event OutpatientDataAdded(uint id, address owner, address doctor, address nurse, string cid);
    event OutpatientDataUpdated(uint id, address owner, address doctor, address nurse, string cid);
    event TemporaryPatientDataAdded(uint id, address staffAddress, address patientAddress, string emrNumber);

    struct AppointmentData { uint id; address patientAddress; address doctorAddress; address nurseAddress; string emrNumber; string cid; }
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

    function addOutpatientData(address _patientAddress, address _doctorAddress, address _nurseAddress, string memory _emrNumber, string memory _cid) external {
        uint appointmentId = appointmentCounter++;
        AppointmentData memory newAppointment = AppointmentData(appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _emrNumber, _cid);
        patientAppointments.push(newAppointment);
        doctorAppointments.push(newAppointment);
        nurseAppointments.push(newAppointment);
        appointmentsByPatient[_patientAddress].push(appointmentId);
        appointmentsByDoctor[_doctorAddress].push(appointmentId);
        appointmentsByNurse[_nurseAddress].push(appointmentId);
        emit OutpatientDataAdded(appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _cid);
    }

    function updateOutpatientData(uint _appointmentId, address _patientAddress, address _doctorAddress, address _nurseAddress, string memory _cid) external {
        require(_appointmentId > 0 && _appointmentId < appointmentCounter, "Invalid appointment ID");
        AppointmentData storage appointment = patientAppointments[_appointmentId - 1];
        require(appointment.patientAddress == _patientAddress, "Unauthorized patient");
        require(appointment.doctorAddress == _doctorAddress, "Unauthorized doctor");
        require(appointment.nurseAddress == _nurseAddress, "Unauthorized nurse");
        appointment.cid = _cid;
        emit OutpatientDataUpdated(_appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _cid);
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

    function removeTemporaryPatientData(address _staffAddress, string memory _emrNumber) external {
        uint[] storage dataIds = temporaryPatientDataByStaff[_staffAddress];
        for (uint i = 0; i < dataIds.length; i++) {
            uint dataId = dataIds[i];
            TemporaryPatientData storage data = temporaryPatientData[dataId - 1];
            if (keccak256(abi.encodePacked(data.emrNumber)) == keccak256(abi.encodePacked(_emrNumber))) {
                uint lastDataId = temporaryPatientData.length;
                temporaryPatientData[dataId - 1] = temporaryPatientData[lastDataId - 1];
                temporaryPatientData.pop();
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
