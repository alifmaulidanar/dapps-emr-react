// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MedicalRecords {
    // Struktur data pasien
    struct Patient {
        uint id;
        string name;
    }

    // Struktur data dokter
    struct Doctor {
        uint id;
        string name;
    }

    uint private patientCounter = 1;
    uint private doctorCounter = 1;

    Patient[] private patients;
    Doctor[] private doctors;

    function addPatient(string memory _name) public payable {
        Patient memory patient = Patient(patientCounter, _name);
        patients.push(patient);
        patientCounter++;
    }

    function addDoctor(string memory _name) public payable {
        Doctor memory doctor = Doctor(doctorCounter, _name);
        doctors.push(doctor);
        doctorCounter++;
    }

    function getPatients() public view returns (Patient[] memory) {
        return patients;
    }

    function getDoctors() public view returns (Doctor[] memory) {
        return doctors;
    }

    function getPatientById(uint _id) public view returns (Patient memory) {
        Patient storage patient = patients[_id - 1];
        return patient;
    }

    function getDoctorById(uint _id) public view returns (Doctor memory) {
        Doctor storage doctor = doctors[_id - 1];
        return doctor;
    }
}
