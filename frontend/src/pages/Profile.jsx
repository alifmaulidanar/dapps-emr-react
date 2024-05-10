import "../index.css";
import { useEffect, useState } from "react";
import { Empty, Button } from "antd";
import NavbarController from "../components/Navbar/NavbarController";
import UserData from "../data/UserData";
import ProfileDropdown from "../components/Buttons/ProfileDropdown";
import { CONN } from "../../../enum-global";
import RegisterDoctorButton from "../components/Buttons/RegisterDoctor";

export default function UserProfile({ role }) {
  const token = sessionStorage.getItem("userToken");
  const accountAddress = sessionStorage.getItem("accountAddress");

  if (!token || !accountAddress) {
    window.location.assign(`/${role}/signin`);
  }

  const [users, setUsers] = useState([]);
  const [userAccountData, setUserAccountData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (token && accountAddress) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${CONN.BACKEND_LOCAL}/${role}/account`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
              },
            }
          );
          const data = await response.json();
          const profiles =
            data.ipfs?.data?.accountProfiles?.map((profile) => ({
              ...profile,
            })) || [];
          setUsers(profiles);
          const accountData = {
            ...data.ipfs.data,
          };
          setUserAccountData(accountData);
          if (profiles.length > 0) {
            setSelectedUser(profiles[0]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchData();
    }
  }, [token, accountAddress]);

  const handleUserChange = (nomorIdentitas) => {
    const user = users.find((p) => p.nomorIdentitas === nomorIdentitas);
    setSelectedUser(user);
  };

  const userDataProps = selectedUser
    ? {
        ...selectedUser,
      }
    : {};

  let type;
  switch (role) {
    case "patient":
      type = 1;
      break;
    case "doctor":
      type = 2;
      break;
    case "nurse":
      type = 3;
      break;
    case "staff":
      type = 4;
      break;
  }

  return (
    <>
      <NavbarController
        type={type}
        page="Profil Pasien"
        color="blue"
        accountAddress={accountAddress}
      />
      <div className="grid justify-center w-9/12 min-h-screen grid-cols-1 px-4 py-24 mx-auto">
        <div className="grid gap-y-4">
          {role === "patient" ? (
            <ProfileDropdown
              users={users}
              onChange={handleUserChange}
              defaultValue={selectedUser?.nomorIdentitas || "Tidak ada pasien"}
            />
          ) : (
            <></>
          )}
          {users.length > 0 ? (
            <div className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg shadow gap-x-8">
              <UserData
                userDataProps={userDataProps}
                userAccountData={userAccountData}
              />
            </div>
          ) : (
            <Empty description="Tidak ada data profil">
              {role === "patient" ? (
                <Button
                  type="primary"
                  className="text-white bg-blue-600 blue-button"
                >
                  Daftarkan Pasien Baru
                </Button>
              ) : (
                <RegisterDoctorButton
                  buttonText={"Lengkapi Profil"}
                  userAccountData={userAccountData}
                />
              )}
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
