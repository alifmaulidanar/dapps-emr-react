import NavbarController from "../../components/Navbar/NavbarController";
import "./../../index.css";
import DoctorData from "../../components/DoctorData";
import DoctorIdentifier from "../../components/DoctorIdentifier";

function DoctorProfile() {
  const doctorIdentifierProps = {
    doctorName: "Dr. Alif Maulidanar",
    doctorImage: "/Alif.jpg",
    doctorAddress: "0x66E167fDd23614b58A4459C1C875C6705f550ED6",
  };

  const doctorDataProps = {
    doctorName: "Dr. Alif Maulidanar",
    doctorIdNumber: "18310893018601",
    doctorBirthLocation: "Jakarta",
    doctorBirthDate: "04/06/2002",
    doctorGender: "Pria",
    doctorBloodType: "O",
    doctorMaritalStatus: "Tidak/Belum Menikah",
    doctorReligion: "Islam",
    doctorJob: "Mahasiswa",
    doctorCitizenship: "Indonesia",
    doctorPhone: "085819130187",
    doctorEmail: "contoh@gmail.com",
    doctorHomeAddress: "Jalan Melati",
    doctorProvince: "Kepulauan Bangka Belitung",
    doctorCity: "Jakarta Selatan",
    doctorSubdistrict: "Tebet",
    doctorVillage: "Tebet Timur",
    doctorPostalCode: "12820",
  };

  return (
    <>
      <NavbarController type={3} page="Profil Dokter" color="blue" />
      <div className="grid grid-cols-1 justify-center min-h-screen w-full min-w-screen mx-auto px-16 py-24">
        <div>
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow grid grid-cols-3 gap-x-8">
            <DoctorIdentifier {...doctorIdentifierProps} />
            <DoctorData {...doctorDataProps} />
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorProfile;
