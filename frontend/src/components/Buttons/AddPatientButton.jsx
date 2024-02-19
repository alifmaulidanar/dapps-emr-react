import { useState, useRef, useEffect } from "react";
import { Button } from "antd";

export default function AddPatientButton() {
  // Modal State
  const [isOpen, setIsOpen] = useState(false);

  const handleModal = () => {
    setIsOpen((prevStat) => !prevStat);
  };

  // Modal Component
  const modalComponent = useRef();

  const handleClickOutside = (event) => {
    if (
      modalComponent.current &&
      !modalComponent.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
              <form className="space-y-6" action="#">
                <div>
                  <label
                    htmlFor="patient__code"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Kode Pasien
                  </label>
                  <input
                    type="text"
                    name="patient__code"
                    id="patient__code"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="0x6..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-green-600 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Cek Pasien
                </button>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-900">
                    Pasien ditemukan
                  </p>
                  <div>
                    <p className="mb-2 text-sm text-gray-900">
                      Alif Maulidanar
                    </p>
                    <span className="bg-green-100 text-green-800 text-sm px-2.5 py-0.5 rounded text-center">
                      0x66E167fDd23614b58A4459C1C875C6705f550ED6
                    </span>
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
