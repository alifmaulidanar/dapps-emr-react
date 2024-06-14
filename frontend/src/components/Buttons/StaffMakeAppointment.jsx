const { Option } = Select;
import Swal from "sweetalert2";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { CONN } from "../../../../enum-global";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Steps, Select, Tag, Radio, Spin } from "antd";
import getSigner from "../utils/getSigner";

export default function MakeAppointmentButtonStaff({ buttonText, scheduleData = [], userData, token }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState({address: "default", name: ""});
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const flatpickrRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [spinning, setSpinning] = React.useState(false);
  const showLoader = () => { setSpinning(true) };

  const selectedDoctor = scheduleData?.find((doc) => doc.doctorAddress === selectedDoctorInfo.address);
  const locations = ["all", ...new Set(scheduleData?.map(doc => doc.lokasiPraktik))];
  let specializations = ["all"];
  if(selectedLocation !== "all") {
    specializations = [
      "all",
      ...new Set(scheduleData.filter(doc => doc.lokasiPraktik === selectedLocation).map(doc => doc.spesialisasi))
    ];
  }

  useEffect(() => {
    if (isModalOpen && flatpickrRef.current) {
      let disableFunction;
      if (selectedDoctorInfo.address !== "default" && selectedDoctor) {
        const enabledDays = selectedDoctor.jadwal.map((jadwal) => {
          return ["Minggu", "Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].indexOf(jadwal.hari);
        });
        disableFunction = function (date) { return !enabledDays.includes(date.getDay()); }
      } else {
        disableFunction = function () { return false; }
      }
      if (window.flatpickrInstance) window.flatpickrInstance.destroy()
      window.flatpickrInstance = flatpickr(flatpickrRef.current, {
        inline: true,
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(30),
        locale: Indonesian,
        defaultDate: selectedDate,
        disable: [disableFunction],
        onChange: (selectedDates, dateStr) => {
          setSelectedDate(dateStr);
          setSelectedTimeSlot(null);
          if (selectedDoctorInfo.address !== "default") {
            const dayName = new Date(dateStr).toLocaleDateString("id-ID", { weekday: "long" });
            const times = selectedDoctor?.jadwal.filter((jadwal) => jadwal.hari === dayName).flatMap((jadwal) => jadwal.waktu);
            setAvailableTimes(times);
          }
        },
      });
    }
    return () => { if (window.flatpickrInstance) window.flatpickrInstance.destroy() };
  }, [isModalOpen, selectedDoctorInfo, scheduleData, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const dayName = date.toLocaleDateString("id-ID", { weekday: "long" });
      setSelectedDay(dayName);
    }
  }, [selectedDate]);

  if (scheduleData.length === 0) return <div>Loading...</div>;

  const filteredDoctors = scheduleData.filter(doc => 
    (selectedLocation === "all" || doc.lokasiPraktik === selectedLocation) && 
    (selectedSpecialization === "all" || doc.spesialisasi === selectedSpecialization)
  );
  const handleSpecializationChange = value => {
    setSelectedSpecialization(value);
    setSelectedDoctorInfo({ address: "default", name: "" });
  };
  const handleLocationChange = value => {
    setSelectedLocation(value);
    setSelectedSpecialization("all");
    setSelectedDoctorInfo({ address: "default", name: "" });
  };
  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);
  const handleNext = () => setCurrentStep(currentStep + 1);
  const handleBack = () => setCurrentStep(currentStep - 1);
  const handleTimeChange = (e) => {
    setSelectedTimeSlot(e.target.value);
    const selectedSchedule = selectedDoctorInfo.jadwal.find(jadwal => jadwal.hari === selectedDay && jadwal.waktu === e.target.value);
    if (!selectedSchedule) setSelectedScheduleId(null);
    setSelectedScheduleId(selectedSchedule.idJadwal);
  };
  const handlePatientSelection = (patient) => setSelectedPatient(patient);
  const renderStepContent = (step) => {
    switch (step) { case 0: return; case 1: return; case 2: return; default: return null; }
  };
  const items = [{ title: "Pilih Jadwal Dokter" }, { title: "Konfirmasi" }];
  const handleDoctorChange = (value) => {
    const dokter = scheduleData.find((doc) => doc.doctorAddress === value);
    if (!dokter) setSelectedDoctorInfo({ address: "default", name: "", jadwal: [] });
    setSelectedDoctorInfo({ address: dokter.doctorAddress, name: dokter.namaDokter, jadwal: dokter.jadwal });
    setSelectedDate(null);
    setAvailableTimes([]);
  };
  const dayColor = (day) => {
    const colorToDay = {
      Senin: "green",
      Selasa: "orange",
      Rabu: "cyan",
      Kamis: "red",
      Jumat: "purple",
      Sabtu: "blue",
      Minggu: "pink",
    };
    return colorToDay[day];
  };
  const doctorDays = (
    <>
      {selectedDoctor && (
        <p>
          {selectedDoctor.jadwal.map((jadwal, index) => (
            <Tag color={dayColor(jadwal.hari)} key={index}>{jadwal.hari}</Tag>
          ))}
        </p>
      )}
    </>
  );
  const timeOptions = availableTimes.map((waktu, index) => (<Radio.Button key={index} value={waktu}>{waktu}</Radio.Button>));
  const selectedScheduleInfo =
    selectedDate && selectedTimeSlot ? (
      <p className="mt-6">
        Anda memilih: <strong>{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</strong>, pukul{" "}
        <strong>{selectedTimeSlot}</strong>
      </p>
    ) : null;
  const doctorInfoSection = (
    <>
      <div className="mb-6">
        {selectedDoctorInfo.address !== "default" && (
          <div className="flex flex-nowrap gap-x-2">
            <p><strong>{selectedDoctorInfo.name}</strong> melakukan praktik di <strong>Eka Hospital {selectedDoctor.lokasiPraktik}</strong> pada hari:</p>
            <p>{doctorDays}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 mb-6">
        <div>
          <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900" >Pilih Tanggal</label>
          <div ref={flatpickrRef}></div>
        </div>
        <div>
          <label htmlFor="time" className="block mb-2 text-sm font-medium text-gray-900" >Pilih Waktu</label>
          <div>
            <Radio.Group onChange={handleTimeChange} value={selectedTimeSlot} className="flex rounded-sm gap-x-4" disabled={false}>{timeOptions}</Radio.Group>
          </div>
          {selectedScheduleInfo}
        </div>
      </div>
    </>
  );
  const handleCreateAppointment = async (event) => {
    try {
      showLoader();
      event.preventDefault();
      const nurseInfo = selectedDoctor.jadwal.find(schedule => schedule.hari === new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long" }) && schedule.waktu === selectedTimeSlot);
      const appointmentData = {
        dmrNumber: userData.dmrNumber,
        nomorIdentitas: userData.profile.nomorIdentitas,
        accountAddress: userData.accountAddress,
        doctorAddress: selectedDoctor.doctorAddress,
        nurseAddress: nurseInfo.nurseAddress,
      };

      // harus ganti data appointment mengikuti new schedules, sesuaikan juga field2 baru dan hapus yang tidak diperlukan lagi. jangan lupa cek referensi dari UI screenshot e-puskesmas langsung
      const appointmentDataIpfs = {
        accountAddress: userData.accountAddress,
        dmrNumber: userData.dmrNumber,
        emrNumber: userData.profile.emrNumber,
        namaLengkap: userData.profile.namaLengkap,
        nomorIdentitas: userData.profile.nomorIdentitas,
        email: userData.profile.email,
        nomorTelepon: userData.profile.nomorTelepon,
        faskesAsal: userData.profile.faskesAsal,
        faskesTujuan: selectedDoctor.lokasiPraktik,
        idDokter: selectedDoctor.idDokter,
        doctorAddress: selectedDoctor.doctorAddress,
        namaDokter: selectedDoctor.namaDokter,
        spesialisasi: selectedDoctor.spesialisasi,
        idJadwal: selectedScheduleId,
        hariTerpilih: `${selectedDay}`,
        tanggalTerpilih: `${selectedDate}`,
        waktuTerpilih: `${selectedTimeSlot}`,
        idPerawat: nurseInfo.idPerawat,
        nurseAddress: nurseInfo.nurseAddress,
        namaAsisten: nurseInfo.namaAsisten,
        status: "ongoing",
        appointmentCreatedAt: new Date().toISOString(),
      };
      const signedData = { appointmentData, appointmentDataIpfs }
      const signer = await getSigner();
      if (!signer) {
        setSpinning(false);
        return;
      }
      const signature = await signer.signMessage(JSON.stringify(signedData));
      signedData.signature = signature;
      console.log("Appointment signature:", signature);
      console.log({signedData})
      const response = await fetch(
        `${CONN.BACKEND_LOCAL}/staff/appointment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(signedData),
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        console.log({ responseData });
        setSpinning(false);
        Swal.fire({
          icon: "success",
          title: "Pendaftaran Profil Pasien Berhasil!",
          text: "Sekarang Anda dapat mengajukan pendaftaran Rawat Jalan.",
        }).then(() => { window.location.reload() });
      } else {
        console.log(responseData.error, responseData.message);
        setSpinning(false);
        Swal.fire({
          icon: "error",
          title: "Pendaftaran Profil Pasien Gagal",
          text: responseData.error,
        });
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      setSpinning(false);
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan saat melakukan pendaftaran",
        text: error,
      });
    }
  };
  return (
    <>
      <button
        onClick={showModal}
        className="px-2 py-2 bg-blue-700 text-white rounded-lg w-full max-w-[180px] hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 text-sm"
      >
        {buttonText}
      </button>

      {/* MODAL ANT DESIGN */}
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1024} style={{ top: 20 }} footer={[]} >
        <h2 className="my-8 text-2xl font-bold text-center">Pendaftaran</h2>
        <div className="grid justify-center w-2/3 grid-cols-2 mx-auto">
          <Steps current={currentStep} labelPlacement="vertical" items={items} className="w-full col-span-2 pt-4" />
        </div>
        <form className="p-8">
          {renderStepContent(currentStep)}

          {/* Pilih Jadwal Dokter */}
          {currentStep === 0 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Pilih Jadwal Dokter
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900" >Pilih Lokasi Berobat</label>
                <Select
                  showSearch
                  style={{ width: 430 }}
                  defaultValue="all"
                  size="large"
                  placeholder="Select a location"
                  onChange={handleLocationChange}
                  disabled={false}
                >
                  {locations.map(loc => (
                    <Option key={loc} value={loc}>{loc === "all" ? "Semua Lokasi" : loc}</Option>
                  ))}
                </Select>
              </div>
              <div className="mb-6">
                <label htmlFor="rs" className="block mb-2 text-sm font-medium text-gray-900" >Pilih Spesialisasi Dokter</label>
                <Select
                  showSearch
                  style={{ width: 430 }}
                  defaultValue="all"
                  size="large"
                  placeholder="Select a specialization"
                  optionFilterProp="children"
                  onChange={handleSpecializationChange}
                  value={selectedSpecialization}
                  disabled={false}
                >
                  {specializations.map(spec => (
                    <Option key={spec} value={spec}>{spec === "all" ? "Semua Spesialisasi" : "Dokter " + spec}</Option>
                  ))}
                </Select>
              </div>
              <div className="mb-6">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900" >Pilih Dokter</label>
                <Select
                  showSearch
                  style={{ width: 430 }}
                  size="large"
                  placeholder="Select a doctor"
                  optionFilterProp="children"
                  value={selectedDoctorInfo.address}
                  onChange={handleDoctorChange}
                  filterOption={ (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                  disabled={false}
                >
                  <Option value="default">Pilih Dokter</Option>
                  {filteredDoctors.map((dokter) => (
                    <Option key={dokter.doctorAddress} value={dokter.doctorAddress}>
                      {dokter.namaDokter} (Dokter {dokter.spesialisasi})
                    </Option>
                  ))}
                </Select>
              </div>
              {doctorInfoSection}
            </div>
          )}

          {/* Pilih Pasien */}
          {/* {currentStep === 1 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Pilih Profil Pasien
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="my-4">
                {userData?.profile?.length ? (
                  userData.profile.map((profile, index) => (
                    <Button
                      key={index}
                      type="primary"
                      onClick={() => handlePatientSelection(index)}
                      style={{ margin: '5px' }}
                      className={selectedPatient === index ? 'bg-blue-500 hover:bg-blue-800 text-white' : 'bg-white text-gray-900 border border-gray-300'}
                    >
                      {`${profile.namaLengkap} (${profile.nomorIdentitas})`}
                    </Button>
                  ))
                ) : (
                  <Empty description="Tidak ada profil pasien yang tersedia" />
                )}
              </div>
            </div>
          )} */}

          {/* Konfirmasi Appointment */}
          {currentStep === 1 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Konfirmasi Appointment
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Lokasi Berobat:</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDoctor.lokasiPraktik}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Dokter yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDoctorInfo.name} (Dokter {selectedDoctor.spesialisasi})</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Jadwal yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}, pukul {selectedTimeSlot}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Profil Pasien yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{userData.profile.namaLengkap} ({userData.profile.nomorIdentitas})</p>
                </div>
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
            {currentStep == 0 && (
              <button
                type="button"
                onClick={handleNext}
                className={`text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center ${ !selectedTimeSlot ? "opacity-50 cursor-not-allowed" : "" }`}
                disabled={!selectedTimeSlot}
              >
                Selanjutnya
              </button>
            )}
            {/* {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNext}
                className={`text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center ${ selectedPatient === null ? "opacity-50 cursor-not-allowed" : "" }`}
                disabled={selectedPatient === null}
              >
                Selanjutnya
              </button>
            )} */}
            {currentStep === 1 && (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-fit sm:w-auto px-5 py-2.5 text-center"
                onClick={handleCreateAppointment}
              >
                Buat Appointment
              </button>
            )}
          </div>
        </form>
        <Spin spinning={spinning} fullscreen />
      </Modal>
    </>
  );
}
