import { Button, Tag } from "antd";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { CONN } from "../../../../enum-global";
import React, { useState, useRef, useEffect, useCallback } from "react";

export default function AddPatientButton({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [emrNumber, setEmrNumber] = useState('');
  const [spinning, setSpinning] = React.useState(false);
  const [patientFound, setPatientFound] = useState(false);
  const [patientAddress, setPatientAddress] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [foundPatientProfile, setFoundPatientProfile] = useState({});
  const modalComponent = useRef();

  const showLoader = () => { setSpinning(true); };
  const getSigner = useCallback(async () => {
    const win = window;
    if (!win.ethereum) { console.error("Metamask not detected"); return; }
    try {
      const accounts = await win.ethereum.request({
        method: "eth_requestAccounts",
      });
      const selectedAccount = accounts[0];
      setSelectedAccount(selectedAccount);
      console.log(selectedAccount);
      const provider = new ethers.providers.Web3Provider(win.ethereum);
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: "0x539",
          chainName: "Ganache",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
          },
          rpcUrls: [CONN.GANACHE_LOCAL],
        },
      ]);
      const signer = provider.getSigner(selectedAccount);
      return signer;
    } catch (error) {
      console.error("Error setting up Web3Provider:", error);
    }
  }, []);

  const handleModal = () => { setIsOpen((prevStat) => !prevStat); }
  const handleClickOutside = (event) => {
    if ( modalComponent.current && !modalComponent.current.contains(event.target)) setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const handleSearchPatient = async (event) => {
    event.preventDefault();
    showLoader();
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/check-patient-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ patientAddress, emrNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        setPatientFound(true);
        setFoundPatientProfile(data.foundPatientProfile);
      } else {
        console.log(data.error, data.message);
        Swal.fire({
          icon: "error",
          title: "Pasien tidak ditemukan",
          text: data.error,
        });
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat mencari pasien",
        text: error,
      });
    } finally {
      setSpinning(false);
    }
  };

  const handleAddPatient = async (event) => {
    event.preventDefault();
    showLoader();
    const formattedData = { patientAddress, emrNumber };
    const signer = await getSigner();
    const signature = await signer.signMessage(JSON.stringify(formattedData));
    formattedData.signature = signature;
    try {
      const response = await fetch(`${CONN.BACKEND_LOCAL}/staff/add-patient-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formattedData),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Pasien berhasil ditambahkan",
          text: "Pasien telah berhasil ditambahkan ke daftar.",
        }).then(
          window.location.reload()
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menambahkan pasien",
          text: data.error,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan",
        text: error,
      });
    } finally {
      setSpinning(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed flex justify-center items-center w-full h-full bg-black/50 top-0 left-0 z-[999]">
          <div
            ref={modalComponent}
            className="w-full h-auto max-w-lg p-5 bg-white rounded-2xl"
          >
            <button
              onClick={handleModal}
              className="block ml-auto text-gray-400 bg-transparent hover:text-gray-900"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
            <div className="px-6 py-6 lg:px-8">
              <h3 className="mb-4 text-xl font-medium text-gray-900">
                Tambah Pasien ke Daftar
              </h3>
              <form className="space-y-6" onSubmit={handleSearchPatient}>
                <div>
                  <label
                    htmlFor="patient__code"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Address Pasien
                  </label>
                  <input
                    type="text"
                    name="patientAddress"
                    id="patientAddress"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="0x6..."
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="patient__code"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Nomor Rekam Medis Pasien
                  </label>
                  <input
                    type="text"
                    name="patientEmrNumber"
                    id="patientEmrNumber"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="0x6..."
                    value={emrNumber}
                    onChange={(e) => setEmrNumber(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-green-600 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cari Pasien
                </button>
              </form>
              <form onSubmit={handleAddPatient}>
                <div className="my-8">
                  <p className="mb-2 text-sm font-medium text-gray-900">
                    Pasien ditemukan
                  </p>
                  <div>
                    <p className="mb-2 text-sm text-gray-900">
                      Nama Lengkap: {foundPatientProfile.namaLengkap}
                    </p>
                    <p className="mb-2 text-sm text-gray-900">
                      No. Rekam Medis:
                      {foundPatientProfile && foundPatientProfile.nomorRekamMedis && (
                        <Tag color="green">{foundPatientProfile.nomorRekamMedis}</Tag>
                      )}
                    </p>
                      {/* <span className="bg-green-100 text-green-800 text-sm px-2.5 py-0.5 rounded text-center">{foundPatientProfile.nomorRekamMedis}</span> */}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Tambah Pasien
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Button
        type="primary"
        onClick={handleModal}
        className="text-white bg-blue-600 blue-button w-full max-w-[150px]"
        // className="px-2 py-2 bg-blue-700 text-white rounded-lg w-full max-w-[150px] hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium"
      >
        Pasien Baru
      </Button>
    </>
  );
}
