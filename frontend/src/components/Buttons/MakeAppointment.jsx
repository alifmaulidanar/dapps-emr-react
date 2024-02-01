import { useState, useEffect, useRef } from "react";
import { Modal, Steps } from "antd";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
// import Datepicker from "../Datepicker";
// import Datepicker from "../Datepicker";

export default function RegisterPatientButton({ buttonText }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const flatpickrRef = useRef(null);

  useEffect(() => {
    if (isModalOpen && flatpickrRef.current) {
      flatpickr(flatpickrRef.current, {
        inline: true,
        dateFormat: "d/m/Y",
        minDate: "today",
        maxDate: new Date().fp_incr(30),
        defaultDate: selectedDate, // Set default date
        onChange: (selectedDates, dateStr, instance) => {
          setSelectedDate(dateStr);
        },
      });
    }
  }, [isModalOpen, currentStep, selectedDate]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return;
      case 1:
        return;
      case 2:
        return;
      default:
        return null;
    }
  };

  // const dateFormat = "DD/MM/YYYY";
  // const customFormat = (value) => `${value.format(dateFormat)}`;

  const items = [
    { title: "Pilih Jadwal Dokter" },
    { title: "Pilih Pasien" },
    { title: "Konfirmasi" },
  ];

  // const Tab = () => (
  //   <Segmented
  //     options={["Identitas Pasien", "Identitas Bayi Baru Lahir"]}
  //     block
  //   />
  // );

  return (
    <>
      <button
        onClick={showModal}
        className="px-2 py-2 bg-blue-700 text-white rounded-lg w-full max-w-[180px] hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 text-sm"
      >
        {buttonText}
      </button>

      {/* MODAL ANT DESIGN */}
      {/* <Button type="primary" onClick={showModal}>
        Open Modal
      </Button> */}
      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1024}
        style={{ top: 20 }}
        footer={[]}
      >
        <h2 className="my-8 text-2xl font-bold text-center">
          Buat Appointment
        </h2>
        <div className="grid justify-center w-2/3 grid-cols-2 mx-auto">
          <Steps
            current={currentStep}
            labelPlacement="vertical"
            items={items}
            className="w-full col-span-2 pt-4"
          />
        </div>
        <form className="p-8">
          {renderStepContent(currentStep)}
          {currentStep === 0 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Pilih Jadwal Dokter
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="gender"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Rumah Sakit
                </label>
                <select
                  id="gender"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                >
                  <option>Pilih Rumah Sakit</option>
                  <option value="0">Jakarta</option>
                  <option value="1">Bekasi</option>
                  <option value="2">Tangerang</option>
                </select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="rs"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Kategori Dokter
                </label>
                <select
                  id="rs"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                >
                  <option>Pilih Kategori Dokter</option>
                  <option value="0">Umum</option>
                </select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Dokter
                </label>
                <select
                  id="category"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                >
                  <option>Pilih Dokter</option>
                  <option value="0">Jakarta</option>
                  <option value="1">Bekasi</option>
                  <option value="2">Tangerang</option>
                </select>
              </div>
              <div className="mb-6">
                <p>
                  Dokter{" "}
                  <span className="font-medium text-gray-900">
                    [NAMA DOKTER]
                  </span>{" "}
                  melakukan pada hari [HARI], [HARI], dan [HARI]
                </p>
              </div>
              <div className="grid grid-cols-2 mb-6">
                <div>
                  <label
                    htmlFor="date"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Pilih Tanggal
                  </label>
                  <div ref={flatpickrRef}></div>
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Pilih Waktu
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Pilih Pasien
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="gender"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Profil Pasien
                </label>
                <select
                  id="gender"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                >
                  <option>Pilih Profil Pasien</option>
                  <option value="0">
                    Budi Santoso (0x1234567890123456789012345678901234567890)
                  </option>
                  <option value="1">
                    Alif Maulidanar (0x66E167fDd23614b58A4459C1C875C6705f550ED6)
                  </option>
                  <option value="2">
                    Citra Indriani (0x9876543210987654321098765432109876543210)
                  </option>
                </select>
              </div>
              <div className="mb-6">
                <p>
                  Belum memiliki profil pasien? Silakan melakukan pendaftaran
                  pasien terlebih dahulu.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Konfirmasi Appointment
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="gender"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Rumah Sakit
                </label>
                <select
                  id="gender"
                  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                >
                  <option>Pilih Rumah Sakit</option>
                  <option value="0">Jakarta</option>
                  <option value="1">Bekasi</option>
                  <option value="2">Tangerang</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 mt-8 text-center gap-x-4">
            {currentStep === 0 && (
              <button
                type="button"
                onClick={handleCancel}
                className="text-white bg-red-700 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
              >
                Batal
              </button>
            )}
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-white bg-red-700 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
              >
                Kembali
              </button>
            )}
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
              >
                Buat Appointment
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}