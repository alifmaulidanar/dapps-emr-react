import { useState, useEffect, useRef } from "react";
import { Modal, Steps, Select, Tag, Radio, Button, Empty } from "antd";
const { Option } = Select;
import flatpickr from "flatpickr";
import { Indonesian } from "flatpickr/dist/l10n/id.js";
import "flatpickr/dist/flatpickr.min.css";

export default function MakeAppointmentButton({ buttonText, scheduleData = [], userData = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState({address: "default", name: ""});
  const [selectedPatient, setSelectedPatient] = useState(null);

  // console.log({userData});
  // console.log({scheduleData});
  
  const flatpickrRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const selectedDoctor = scheduleData?.doctors?.find((doc) => doc.doctor_address === selectedDoctorInfo.address);

  const locations = ["all", ...new Set(scheduleData?.doctors?.map(doc => doc.location))];
  let specializations = ["all"];
  if(selectedLocation !== "all") {
    specializations = [
      "all",
      ...new Set(scheduleData.doctors.filter(doc => doc.location === selectedLocation).map(doc => doc.specialization))
    ];
  }

  useEffect(() => {
    if (isModalOpen && flatpickrRef.current) {
      let disableFunction;
      if (selectedDoctorInfo.address !== "default" && selectedDoctor) {
        const enabledDays = selectedDoctor.schedules.map((schedule) => {
          return ["Minggu", "Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].indexOf(schedule.day);
        });
        disableFunction = function (date) {return !enabledDays.includes(date.getDay());};
      } else {
        disableFunction = function () {return false;};
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
            const times = selectedDoctor?.schedules
            .filter((schedule) => schedule.day === dayName)
            .flatMap((schedule) => schedule.time);
            setAvailableTimes(times);
          }
        },
      });
    }
    return () => { if (window.flatpickrInstance) window.flatpickrInstance.destroy() };
  }, [isModalOpen, selectedDoctorInfo, scheduleData, selectedDate]);

  if (scheduleData.length === 0) return <div>Loading...</div>;

  const filteredDoctors = scheduleData.doctors.filter(doc => 
    (selectedLocation === "all" || doc.location === selectedLocation) && 
    (selectedSpecialization === "all" || doc.specialization === selectedSpecialization)
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
  const handleTimeChange = (e) => setSelectedTimeSlot(e.target.value);
  const handlePatientSelection = (patient) => setSelectedPatient(patient);

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

  const items = [
    { title: "Pilih Jadwal Dokter" },
    { title: "Pilih Pasien" },
    { title: "Konfirmasi" },
  ];

  const handleDoctorChange = (value) => {
    const doctor = scheduleData.doctors.find((doc) => doc.doctor_address === value);

    if (doctor) {
      setSelectedDoctorInfo({ address: doctor.doctor_address, name: doctor.doctor_name });
    } else {
      setSelectedDoctorInfo({ address: "default", name: "" });
    }
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
          {selectedDoctor.schedules.map((schedule, index) => (
            <Tag color={dayColor(schedule.day)} key={index}>
              {schedule.day}
            </Tag>
          ))}
        </p>
      )}
    </>
  );

  const timeOptions = availableTimes.map((time, index) => (
    <Radio.Button key={index} value={time}>
      {time}
    </Radio.Button>
  ));

  const selectedScheduleInfo =
    selectedDate && selectedTimeSlot ? (
      <p className="mt-6">
        Anda telah memilih: <strong>{selectedDate}</strong>,{" "}
        <strong>{selectedTimeSlot}</strong>
      </p>
    ) : null;

  const doctorInfoSection = (
    <>
      <div className="mb-6">
        {selectedDoctorInfo.address !== "default" && (
          <div className="flex flex-nowrap gap-x-2">
            <p>
              <span className="font-medium text-gray-900">
                {selectedDoctorInfo.name}
              </span>{" "}
              melakukan praktik pada hari:
            </p>
            <p>{doctorDays}</p>
          </div>
        )}
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
          <div>
            <Radio.Group onChange={handleTimeChange} value={selectedTimeSlot} className="flex rounded-sm gap-x-4">
              {timeOptions}
            </Radio.Group>
          </div>
          {selectedScheduleInfo}
        </div>
      </div>
    </>
  );

  // buat sebuah handle untuk menyimpan data pembuatan appointment baru yand dilakukan pada setiap step modal "Buat Appointment". satukan data menjadi appointmentData yang berupa object. appointmentData berisi: accountAddress, nomorIdentitas (dari profil pasien terpilih), address doctor terpilih, address nurse dari schedule terpilih (dari scheduleData). dan buat 1 object lagi bernama appointmentDataIpfs untuk menampung data yang akan dikirimkan ke IPFS (lebih lengkap), meliputi: appointmentId (gunakan uuid), accountAddress, accountEmail, namaLengkap, nomorIdentitas, email, lokasi rumah sakit terpilih, spesialisasi terpilih, dokter terpilih, nurse terpilih berdasarkan schedule, jadwal terpilih (tanggal dan waktu), dan status == ongoing. setelah itu console log kedua object.
  const handleCreateAppointment = () => {
    const appointmentData = {
      accountAddress: userData.accountAddress,
      nomorIdentitas: userData.accountProfiles[selectedPatient].nomorIdentitas,
      doctorAddress: selectedDoctorInfo.address,
      nurseAddress: selectedDoctor.nurse_address,
    };
    console.log({ appointmentData });

    const appointmentDataIpfs = {
      // appointmentId: uuidv4(),
      accountAddress: userData.accountAddress,
      accountEmail: userData.accountEmail,
      namaLengkap: userData.accountProfiles[selectedPatient].namaLengkap,
      nomorIdentitas: userData.accountProfiles[selectedPatient].nomorIdentitas,
      email: userData.accountEmail,
      lokasiRumahSakit: selectedLocation,
      spesialisasi: selectedSpecialization,
      dokter: selectedDoctorInfo.name,
      nurse: selectedDoctor.nurse_name,
      jadwal: `${selectedDate}, ${selectedTimeSlot}`,
      status: "ongoing",
    };
    console.log({ appointmentDataIpfs });
  };

  console.log({selectedTimeSlot});

  return (
    <>
      <button
        onClick={showModal}
        className="px-2 py-2 bg-blue-700 text-white rounded-lg w-full max-w-[180px] hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 text-sm"
      >
        {buttonText}
      </button>

      {/* MODAL ANT DESIGN */}
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

          {/* Pilih Jadwal Dokter */}
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
                <Select
                  showSearch
                  style={{ width: 430 }}
                  defaultValue="all"
                  size="large"
                  placeholder="Select a location"
                  onChange={handleLocationChange}
                >
                  {locations.map(loc => (
                    <Option key={loc} value={loc}>{loc === "all" ? "Semua Lokasi" : "Eka Hospital " + loc}</Option>
                  ))}
                </Select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="rs"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Spesialisasi Dokter
                </label>
                <Select
                  showSearch
                  style={{ width: 430 }}
                  defaultValue="all"
                  size="large"
                  placeholder="Select a specialization"
                  optionFilterProp="children"
                  onChange={handleSpecializationChange}
                  value={selectedSpecialization}
                >
                  {specializations.map(spec => (
                    <Option key={spec} value={spec}>{spec === "all" ? "Semua Spesialisasi" : "Dokter " + spec}</Option>
                  ))}
                </Select>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pilih Dokter
                </label>
                <Select
                  showSearch
                  style={{ width: 430 }}
                  size="large"
                  placeholder="Select a doctor"
                  optionFilterProp="children"
                  value={selectedDoctorInfo.address}
                  onChange={handleDoctorChange}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value="default">Pilih Dokter</Option>
                  {filteredDoctors.map((doctor) => (
                    <Option key={doctor.doctor_address} value={doctor.doctor_address}>
                      {doctor.doctor_name} (Dokter {doctor.specialization})
                    </Option>
                  ))}
                </Select>
              </div>
              {doctorInfoSection}
            </div>
          )}

          {/* Pilih Pasien */}
          {currentStep === 1 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Pilih Profil Pasien
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="my-4">
                {userData?.accountProfiles?.length ? (
                  userData.accountProfiles.map((profile, index) => (
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
          )}

          {/* Konfirmasi Appointment */}
          {currentStep === 2 && (
            <div className="grid">
              <div className="mb-6 text-lg font-medium text-gray-900">
                Konfirmasi Appointment
                <hr className="h-px bg-gray-700 border-0"></hr>
              </div>
              <div className="mb-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Lokasi Rumah Sakit:</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedLocation === "all" ? "Semua Lokasi" : "Eka Hospital " + selectedLocation}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Dokter yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDoctorInfo.name} (Dokter {selectedSpecialization})</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Jadwal yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDate}, {selectedTimeSlot}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-900">Profil Pasien yang dipilih:</p>
                  <p className="text-lg font-semibold text-gray-900">{userData.accountProfiles[selectedPatient].namaLengkap} ({userData.accountProfiles[selectedPatient].nomorIdentitas})</p>
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
                onClick={handleCreateAppointment}
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
