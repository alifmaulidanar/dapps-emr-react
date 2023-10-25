// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MedicalRecords {
    struct Patient {
        string username;
        string email;
        string phone;
        string password;
        Profile[] profiles;
    }

    struct Profile {
        address patientAddress;
        string patientIdNumber;
        string patientName;
        string patientBirthLocation;
        string patientBirthDate;
        string patientGender;
        string patientBloodType;
        string patientAllergic;
        string patientMaritalStatus;
        string patientReligion;
        string patientJob;
        string patientCitizenship;
        string patientPhone;
        string patientEmail;
        string patientHomeAddress;
        string patientProvince;
        string patientCity;
        string patientSubdistrict;
        string patientVillage;
        string patientPostalCode;
        Relatives relatives;
        Record[] records;
    }

    struct Relatives {
        string relativesName;
        string relativesIdNumber;
        string relativesGender;
        string relativesBirthDate;
        string relativesPhone;
        string relativesRelation;
        string relativesHomeAddress;
        string relativesProvince;
        string relativesCity;
        string relativesSubdistrict;
        string relativesVillage;
        string relativesPostalCode;
    }

    struct Record {
        address recordAddress;
        address patientAddress;
        string recordDate;
        string recordTitle;
        address doctorAddress;
        string doctorName;
        string recordAnamnesis;
        string recordDiagnosis;
        string recordTherapy;
        string recordNotes;
        File[] recordFiles;
    }

    struct File {
        string fileId;
        string fileName;
        string fileDescription;
    }

    mapping(address => Patient) public patients;

    event NewPatientRegistered(address indexed patientAddress, string username);
    event NewProfileAdded(
        address indexed patientAddress,
        uint indexed profileIndex,
        string patientName
    );
    event NewRecordAdded(
        address indexed patientAddress,
        uint indexed profileIndex,
        uint indexed recordIndex,
        string recordTitle
    );

    function registerPatient(
        string memory _username,
        string memory _email,
        string memory _phone,
        string memory _password
    ) public payable {
        require(
            bytes(patients[msg.sender].username).length == 0,
            "Patient account already exists."
        );

        patients[msg.sender] = Patient({
            username: _username,
            email: _email,
            phone: _phone,
            password: _password,
            profiles: new Profile[](0)
        });

        emit NewPatientRegistered(msg.sender, _username);
    }

    function addProfile(
        address _patientAddress,
        string memory _patientIdNumber,
        string memory _patientName,
        string memory _patientBirthLocation,
        string memory _patientBirthDate,
        string memory _patientGender,
        string memory _patientBloodType,
        string memory _patientAllergic,
        string memory _patientMaritalStatus,
        string memory _patientReligion,
        string memory _patientJob,
        string memory _patientCitizenship,
        string memory _patientPhone,
        string memory _patientEmail,
        string memory _patientHomeAddress,
        string memory _patientProvince,
        string memory _patientCity,
        string memory _patientSubdistrict,
        string memory _patientVillage,
        string memory _patientPostalCode,
        string memory _relativesName,
        string memory _relativesIdNumber,
        string memory _relativesGender,
        string memory _relativesBirthDate,
        string memory _relativesPhone,
        string memory _relativesRelation,
        string memory _relativesHomeAddress,
        string memory _relativesProvince,
        string memory _relativesCity,
        string memory _relativesSubdistrict,
        string memory _relativesVillage,
        string memory _relativesPostalCode
    ) public payable {
        require(
            bytes(patients[_patientAddress].username).length != 0,
            "Patient account does not exist."
        );

        Profile memory newProfile = Profile({
            patientAddress: _patientAddress,
            patientIdNumber: _patientIdNumber,
            patientName: _patientName,
            patientBirthLocation: _patientBirthLocation,
            patientBirthDate: _patientBirthDate,
            patientGender: _patientGender,
            patientBloodType: _patientBloodType,
            patientAllergic: _patientAllergic,
            patientMaritalStatus: _patientMaritalStatus,
            patientReligion: _patientReligion,
            patientJob: _patientJob,
            patientCitizenship: _patientCitizenship,
            patientPhone: _patientPhone,
            patientEmail: _patientEmail,
            patientHomeAddress: _patientHomeAddress,
            patientProvince: _patientProvince,
            patientCity: _patientCity,
            patientSubdistrict: _patientSubdistrict,
            patientVillage: _patientVillage,
            patientPostalCode: _patientPostalCode,
            relatives: Relatives({
                relativesName: _relativesName,
                relativesIdNumber: _relativesIdNumber,
                relativesGender: _relativesGender,
                relativesBirthDate: _relativesBirthDate,
                relativesPhone: _relativesPhone,
                relativesRelation: _relativesRelation,
                relativesHomeAddress: _relativesHomeAddress,
                relativesProvince: _relativesProvince,
                relativesCity: _relativesCity,
                relativesSubdistrict: _relativesSubdistrict,
                relativesVillage: _relativesVillage,
                relativesPostalCode: _relativesPostalCode
            }),
            records: new Record[](0)
        });

        patients[_patientAddress].profiles.push(newProfile);

        emit NewProfileAdded(
            _patientAddress,
            patients[_patientAddress].profiles.length - 1,
            _patientName
        );
    }

    function addRecord(
        address _patientAddress,
        uint _profileIndex,
        string memory _recordDate,
        string memory _recordTitle,
        address _doctorAddress,
        string memory _doctorName,
        string memory _recordAnamnesis,
        string memory _recordDiagnosis,
        string memory _recordTherapy,
        string memory _recordNotes,
        string[] memory _recordFiles
    ) external {
        require(
            bytes(patients[_patientAddress].username).length != 0,
            "Patient account does not exist."
        );

        Profile storage profile = patients[_patientAddress].profiles[
            _profileIndex
        ];

        Record memory newRecord = Record({
            recordAddress: msg.sender,
            patientAddress: _patientAddress,
            recordDate: _recordDate,
            recordTitle: _recordTitle,
            doctorAddress: _doctorAddress,
            doctorName: _doctorName,
            recordAnamnesis: _recordAnamnesis,
            recordDiagnosis: _recordDiagnosis,
            recordTherapy: _recordTherapy,
            recordNotes: _recordNotes,
            recordFiles: new File[](0)
        });

        File[] memory recordFiles = new File[](_recordFiles.length);

        for (uint i = 0; i < _recordFiles.length; i++) {
            recordFiles[i] = File({
                fileId: _recordFiles[i],
                fileName: "",
                fileDescription: ""
            });
        }

        profile.records.push(newRecord);

        emit NewRecordAdded(
            _patientAddress,
            _profileIndex,
            profile.records.length - 1,
            _recordTitle
        );
    }

    // Fungsi untuk mengedit profil pasien
    function editProfile(
        address _patientAddress,
        uint _profileIndex,
        string memory _patientPhone,
        string memory _patientEmail,
        string memory _patientHomeAddress,
        string memory _patientPostalCode
    ) external {
        require(
            bytes(patients[_patientAddress].username).length != 0,
            "Patient account does not exist."
        );
        Profile storage profile = patients[_patientAddress].profiles[
            _profileIndex
        ];

        // Memperbarui informasi pada profil pasien
        profile.patientPhone = _patientPhone;
        profile.patientEmail = _patientEmail;
        profile.patientHomeAddress = _patientHomeAddress;
        profile.patientPostalCode = _patientPostalCode;
    }
}
