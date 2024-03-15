// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract OutpatientManagement {
  event OutpatientDataAdded(uint id, address owner, address doctor, address nurse, string cid, uint createdAt);
  struct OutpatientData {uint id; address patientAddress; string patientProfileId; address doctor; address nurse; string cid; uint createdAt; }

  mapping(address => uint[]) private appointmentsByPatient;
  mapping(address => uint[]) private appointmentsByDoctor;
  mapping(address => uint[]) private appointmentsByNurse;
  uint private outpatientDataCounter = 1;
  OutpatientData[] private outpatientData;

  function addOutpatientData(address _patientAddress, string memory _patientProfileId, address _doctor, address _nurse, string memory _cid) external {
      // Validasi input dan pastikan bahwa _patientAddress, _doctor, dan _nurse adalah valid
      OutpatientData memory newOutpatientData = OutpatientData(
          outpatientDataCounter++,
          _patientAddress,
          _patientProfileId,
          _doctor,
          _nurse,
          _cid,
          block.timestamp
      );
      outpatientData.push(newOutpatientData);
      appointmentsByPatient[_patientAddress].push(newOutpatientData.id);
      appointmentsByDoctor[_doctor].push(newOutpatientData.id);
      appointmentsByNurse[_nurse].push(newOutpatientData.id);
  }

  function getAllAppointments() external view returns (OutpatientData[] memory) {
      return outpatientData;
  }

  function getAppointmentsByPatient(address _patientAddress) external view returns (OutpatientData[] memory) {
      uint[] memory appointmentIds = appointmentsByPatient[_patientAddress];
      OutpatientData[] memory appointments = new OutpatientData[](appointmentIds.length);
      for (uint i = 0; i < appointmentIds.length; i++) {
          appointments[i] = outpatientData[appointmentIds[i] - 1];
      }
      return appointments;
  }

  function getAppointmentsByNurse(address _nurseAddress) external view returns (OutpatientData[] memory) {
      uint[] memory appointmentIds = appointmentsByNurse[_nurseAddress];
      OutpatientData[] memory appointments = new OutpatientData[](appointmentIds.length);
      for (uint i = 0; i < appointmentIds.length; i++) {
          appointments[i] = outpatientData[appointmentIds[i] - 1];
      }
      return appointments;
  }

  function getAppointmentsByDoctor(address _doctorAddress) external view returns (OutpatientData[] memory) {
      uint[] memory appointmentIds = appointmentsByDoctor[_doctorAddress];
      OutpatientData[] memory appointments = new OutpatientData[](appointmentIds.length);
      for (uint i = 0; i < appointmentIds.length; i++) {
          appointments[i] = outpatientData[appointmentIds[i] - 1];
      }
      return appointments;
  }
}