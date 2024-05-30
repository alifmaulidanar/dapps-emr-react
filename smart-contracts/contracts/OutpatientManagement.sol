// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract OutpatientManagement {
    event OutpatientDataAdded(string id, address owner, address doctor, address nurse, string cid);
    event OutpatientDataUpdated(string id, address owner, address doctor, address nurse, string cid);
    event TemporaryPatientDataAdded(uint id, address staffAddress, address patientAddress, string emrNumber);

    struct AppointmentData { string id; address patientAddress; address doctorAddress; address nurseAddress; string emrNumber; string cid; }
    struct TemporaryPatientData { uint id; address nakesAddress; address patientAddress; string emrNumber; uint addedAt; }

    mapping(address => string[]) private appointmentsByPatient;
    mapping(address => string[]) private appointmentsByDoctor;
    mapping(address => string[]) private appointmentsByNurse;
    mapping(address => uint[]) private temporaryPatientDataByNakes;

    uint private temporaryPatientDataCounter = 1;
    AppointmentData[] private patientAppointments;
    AppointmentData[] private doctorAppointments;
    AppointmentData[] private nurseAppointments;
    TemporaryPatientData[] private temporaryPatientData;

    function addOutpatientData(address _patientAddress, address _doctorAddress, address _nurseAddress, string memory _appointmentId, string memory _emrNumber, string memory _cid) external {
        AppointmentData memory newAppointment = AppointmentData(_appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _emrNumber, _cid);
        patientAppointments.push(newAppointment);
        doctorAppointments.push(newAppointment);
        nurseAppointments.push(newAppointment);
        appointmentsByPatient[_patientAddress].push(_appointmentId);
        appointmentsByDoctor[_doctorAddress].push(_appointmentId);
        appointmentsByNurse[_nurseAddress].push(_appointmentId);
        emit OutpatientDataAdded(_appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _cid);
    }

    function updateOutpatientData(string memory _appointmentId, address _patientAddress, address _doctorAddress, address _nurseAddress, string memory _cid) external {
        bool found = false;
        for (uint i = 0; i < patientAppointments.length; i++) {
            if (keccak256(abi.encodePacked(patientAppointments[i].id)) == keccak256(abi.encodePacked(_appointmentId))) {
                require(patientAppointments[i].patientAddress == _patientAddress, "Unauthorized patient");
                require(patientAppointments[i].doctorAddress == _doctorAddress, "Unauthorized doctor");
                require(patientAppointments[i].nurseAddress == _nurseAddress, "Unauthorized nurse");
                patientAppointments[i].cid = _cid;
                found = true;
                emit OutpatientDataUpdated(_appointmentId, _patientAddress, _doctorAddress, _nurseAddress, _cid);
                break;
            }
        }
        require(found, "Appointment not found");
    }

    function getAllAppointments() external view returns (AppointmentData[] memory, AppointmentData[] memory, AppointmentData[] memory) {
        return (patientAppointments, doctorAppointments, nurseAppointments);
    }

    function getAppointmentsByPatient(address _patientAddress) external view returns (AppointmentData[] memory) {
        string[] memory appointmentIds = appointmentsByPatient[_patientAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) {
            for (uint j = 0; j < patientAppointments.length; j++) {
                if (keccak256(abi.encodePacked(patientAppointments[j].id)) == keccak256(abi.encodePacked(appointmentIds[i]))) {
                    appointments[i] = patientAppointments[j];
                    break;
                }
            }
        }
        return appointments;
    }

    function getAppointmentsByDoctor(address _doctorAddress) external view returns (AppointmentData[] memory) {
        string[] memory appointmentIds = appointmentsByDoctor[_doctorAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) {
            for (uint j = 0; j < doctorAppointments.length; j++) {
                if (keccak256(abi.encodePacked(doctorAppointments[j].id)) == keccak256(abi.encodePacked(appointmentIds[i]))) {
                    appointments[i] = doctorAppointments[j];
                    break;
                }
            }
        }
        return appointments;
    }

    function getAppointmentsByNurse(address _nurseAddress) external view returns (AppointmentData[] memory) {
        string[] memory appointmentIds = appointmentsByNurse[_nurseAddress];
        AppointmentData[] memory appointments = new AppointmentData[](appointmentIds.length);
        for (uint i = 0; i < appointmentIds.length; i++) {
            for (uint j = 0; j < nurseAppointments.length; j++) {
                if (keccak256(abi.encodePacked(nurseAppointments[j].id)) == keccak256(abi.encodePacked(appointmentIds[i]))) {
                    appointments[i] = nurseAppointments[j];
                    break;
                }
            }
        }
        return appointments;
    }

    function addTemporaryPatientData(address _nakesAddress, address _patientAddress, string memory _emrNumber) external {
        TemporaryPatientData memory newTemporaryPatientData = TemporaryPatientData( temporaryPatientDataCounter, _nakesAddress, _patientAddress, _emrNumber, block.timestamp);
        temporaryPatientData.push(newTemporaryPatientData);
        temporaryPatientDataByNakes[_nakesAddress].push(temporaryPatientDataCounter);
        temporaryPatientDataCounter++;
        emit TemporaryPatientDataAdded(newTemporaryPatientData.id, _nakesAddress, _patientAddress, _emrNumber);
    }

    function removeTemporaryPatientData(address _nakesAddress, address _patientAddress, string memory _emrNumber) external {
        uint[] storage dataIds = temporaryPatientDataByNakes[_nakesAddress];
        for (uint i = 0; i < dataIds.length; i++) {
            uint dataId = dataIds[i];
            TemporaryPatientData storage data = temporaryPatientData[dataId - 1];
            if (data.nakesAddress == _nakesAddress && data.patientAddress == _patientAddress &&
                keccak256(abi.encodePacked(data.emrNumber)) == keccak256(abi.encodePacked(_emrNumber))) {
                delete temporaryPatientData[dataId - 1];
                dataIds[i] = dataIds[dataIds.length - 1];
                dataIds.pop();
                break;
            }
        }
    }

    function getTemporaryPatientData(address _nakesAddress) external view returns (TemporaryPatientData[] memory) {
        uint[] memory dataIds = temporaryPatientDataByNakes[_nakesAddress];
        TemporaryPatientData[] memory data = new TemporaryPatientData[](dataIds.length);
        for (uint i = 0; i < dataIds.length; i++) {
            for (uint j = 0; j < temporaryPatientData.length; j++) {
                if (temporaryPatientData[j].id == dataIds[i]) { data[i] = temporaryPatientData[j]; break; }
            }
        }
        return data;
    }

    function getAllTemporaryPatientData() external view returns (TemporaryPatientData[] memory) {
        return temporaryPatientData;
    }
}
