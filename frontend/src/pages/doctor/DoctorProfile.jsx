import "../../index.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Empty } from "antd";
import NavbarController from "../../components/Navbar/NavbarController";
import RegisterDoctorButton from "../../components/Buttons/RegisterDoctor";
import UserData from "../../data/UserData";
import { CONN } from "../../../../enum-global";

function DoctorProfile() {
  const { accountAddress } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [doctorAccountData, setDoctorAccountData] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const capitalizedAccountAddress =
      accountAddress.charAt(0) +
      accountAddress.charAt(1) +
      accountAddress.substring(2).toUpperCase();

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${CONN.BACKEND_LOCAL}/doctor/${capitalizedAccountAddress}/account`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        const profiles =
          data.ipfs?.data?.accountProfiles?.map((profile) => ({
            ...profile,
          })) || [];
        setDoctors(profiles);
        const accountData = {
          accountAddress: data.ipfs.data.accountAddress,
          accountEmail: data.ipfs.data.accountEmail,
          accountPhone: data.ipfs.data.accountPhone,
          accountRole: data.ipfs.data.accountRole,
          accountUsername: data.ipfs.data.accountUsername,
        };
        setDoctorAccountData(accountData);
        if (profiles.length > 0) {
          setSelectedDoctor(profiles[0]);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    fetchData();
  }, []);

  const doctorDataProps = selectedDoctor
    ? {
        ...selectedDoctor,
      }
    : {};

  return (
    <>
      <NavbarController
        type={4}
        page="Profil Pasien"
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-1 px-4 py-24 mx-auto">
        <div className="grid gap-y-4">
          {doctors.length > 0 ? (
            <div className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
              <UserData
                userDataProps={doctorDataProps}
                userAccountData={doctorAccountData}
              />
            </div>
          ) : (
            <Empty description="Profil dokter tidak ditemukan">
              <RegisterDoctorButton
                buttonText={"Lengkapi Profil Dokter"}
                doctorAccountData={doctorAccountData}
              />
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}

export default DoctorProfile;
