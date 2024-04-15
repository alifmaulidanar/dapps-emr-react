import { createRoot } from 'react-dom/client';
import { Tag, Card } from "antd";
import { CONN } from "../../../enum-global";
import { FileOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const PatientRecordLoop = ({ data }) => {
  return (
    <>
      {data.map(({ key, value1, value2 }) => (
        <div key={key} className="mb-6">
          <h3 className="block mb-2 text-sm font-medium text-gray-900">{value1}</h3>
          <p className="text-sm text-gray-900">{value2}</p>
        </div>
      ))}
    </>
  );
};

function PatientRecordDisplay({ record, chosenPatient, appointmentData }) {
  useEffect(() => {
    if (record.lampiranRekamMedis) {
      fetch(`${CONN.IPFS_LOCAL}/${record.lampiranRekamMedis}`)
      .then(response => response.json())
      .then(bundleContent => {
          const root = createRoot(document.getElementById("lampiran"));
          const cards = bundleContent.map(fileData => {
            const blob = new Blob([new Uint8Array(fileData.content.data)]);
            const url = URL.createObjectURL(blob);
            let attachmentElement;
            let previewElement;
            if (fileData.path.endsWith('.png') || fileData.path.endsWith('.jpg') || fileData.path.endsWith('.jpeg')) {
              // Display image file
              attachmentElement = document.createElement('img');
              attachmentElement.src = url;
              attachmentElement.alt = fileData.path;
              previewElement = <img alt={fileData.path} src={url} style={{ width: '28px', height: 'auto' }} />;
            } else {
              // Display other file types as download links
              attachmentElement = document.createElement('img');
              attachmentElement.src = url;
              attachmentElement.alt = fileData.path;
              previewElement = <FileOutlined style={{ fontSize: '28px' }} />;
            }
            const fileName = fileData.path.split('.').slice(0, -1).join('.');
            const fileExtension = fileData.path.split('.').pop();
            const cardContent = (
              <>
                {previewElement}
              </>
            );
            return (
              <Card key={fileData.path} className="w-[115px] h-fit hover:shadow">
                <a href={url} download={fileData.path} className="grid justify-items-center gap-y-2 hover:text-gray-900">
                  {cardContent}
                  <p>{fileName}.{fileExtension}</p>
                </a>
              </Card>
            );
          });
          root.render(cards, document.createElement('div'));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, [record.lampiranRekamMedis]);

  function convertProfileData(state) {
    const convertedState = {...state};
    const rumahSakitAsalMap = { '1': 'Eka Hospital Bekasi', '2': 'Eka Hospital BSD', '3': 'Eka Hospital Jakarta', '4': 'Eka Hospital Lampung' };
    const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
    const golonganDarahMap = { '1': 'A', '2': 'B', '3': 'AB', '4': 'O', '5': 'A+', '6': 'A-', '7': 'B+', '8': 'B-', '9': 'AB+', '10': 'AB-', '11': 'O+', '12': 'O-', '13': 'Tidak tahu' };
    const riwayatAlergi = { '0': 'Tidak ada', '1': 'Obat', '2': 'Makanan', '3': 'Udara', '4': 'Lainnya' };
    const tingkatKesadaran = { '0': 'Sadar Baik/Alert', '1': 'Berespons dengan kata-kata/Voice', '2': 'Hanya berespons jika dirangsang nyeri/Pain', '3': 'Pasien tidak sadar/Unresponsive', '4': 'Gelisah atau bingung', '5': 'Acute Confusional States' };
    const statusPsikologis = { '1': 'Tidak ada kelainan', '2': 'Cemas', '3': 'Takut', '4': 'Marah', '5': 'Sedih', '6': 'Lain-lain' };
    const konfirmasiTindakan = { '1': 'Ya', '2': 'Tidak' };
    convertedState.rumahSakitAsal = rumahSakitAsalMap[convertedState.rumahSakitAsal];
    convertedState.gender = genderMap[convertedState.gender];
    convertedState.golonganDarah = golonganDarahMap[convertedState.golonganDarah];
    convertedState.genderKerabat = genderMap[convertedState.genderKerabat];
    convertedState.riwayatAlergi = riwayatAlergi[convertedState.riwayatAlergi];
    convertedState.tingkatKesadaran = tingkatKesadaran[convertedState.tingkatKesadaran];
    convertedState.statusPsikologis = statusPsikologis[convertedState.statusPsikologis];
    convertedState.konfirmasiTindakan = konfirmasiTindakan[convertedState.konfirmasiTindakan];
    return convertedState;
  }
  const patientDataProps1 = [
    { key: "nomorIdentitas", value1: "Nomor Identitas", value2: <Tag color="blue" className="m-0">{chosenPatient.nomorIdentitas}</Tag> },
    { key: "nomorRekamMedis", value1: "Nomor Rekam Medis", value2: <Tag color="blue" className="m-0">{chosenPatient.nomorRekamMedis}</Tag> },
    { key: "namaLengkap", value1: "Nama Lengkap Pasien", value2: <p>{chosenPatient.namaLengkap}</p> },
    { key: "rumahSakitAsal", value1: "Rumah Sakit Asal", value2: <p>{convertProfileData(chosenPatient).rumahSakitAsal}</p> },
    { key: "tempatLahir", value1: "Tempat Lahir", value2: <p>{chosenPatient.tempatLahir}</p> },
    { key: "tanggalLahir", value1: "Tanggal Lahir", value2: <p>{new Date(chosenPatient.tanggalLahir).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p> },
    {  key: "gender", value1: "Jenis Kelamin", value2: <p>{convertProfileData(chosenPatient).gender}</p> },
    { key: "golonganDarah", value1: "Golongan Darah", value2: <p>{convertProfileData(chosenPatient).golonganDarah}</p> },
  ];
  const patientDataProps2 = [
    // { key: "appointmentId", value1: "ID Pendaftaran Rawat Jalan", value2: <Tag color="green" className="m-0">{record.appointmentId}</Tag> },
    { key: "rumahSakit", value1: "Lokasi Pemeriksaan", value2: <p>Eka Hospital {appointmentData.rumahSakit}</p> },
    { key: "appointmentCreatedAt", value1: "Tanggal Pendaftaran Rawat Jalan", value2: <p>{new Date(record.appointmentCreatedAt).toLocaleString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</p> },
    { key: "judulRekamMedis", value1: "Judul Rekam Medis", value2: <p>{record.judulRekamMedis}</p> },
    { key: "tanggalRekamMedis", value1: "Tanggal dan Waktu Rekam Medis", value2: <p>{new Date(record.tanggalRekamMedis).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} pukul {record.waktuPenjelasanTindakan?.split(":").slice(0, 2).join(":")}</p> },
    { key: "namaDokter", value1: "Nama Dokter", value2: <p>{appointmentData.namaDokter}</p> },
    { key: "alamatDokter", value1: "Alamat Dokter", value2: <Tag color="gold" className="m-0">{appointmentData.alamatDokter}</Tag> },
    { key: "namaPerawat", value1: "Nama Perawat", value2: <p>{appointmentData.namaPerawat}</p> },
    { key: "alamatPerawat", value1: "Alamat Perawat", value2: <Tag color="gold" className="m-0">{appointmentData.alamatPerawat}</Tag> },
  ];
  const patientDataProps3 = [
    { key: "keluhanUtama", value1: "Keluhan Utama", value2: <p>{record.keluhanUtama || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "riwayatPenyakit", value1: "Riwayat Penyakit", value2: <p>{record.riwayatPenyakit || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "riwayatAlergi", value1: "Riwayat Alergi", value2: <p>{convertProfileData(record).riwayatAlergi || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "riwayatAlergiLainnya", value1: "Riwayat Alergi Lainnya", value2: <p>{record.riwayatAlergiLainnya || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "riwayatPengobatan", value1: "Riwayat Pengobatan", value2: <p>{record.riwayatPengobatan || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "tingkatKesadaran", value1: "Tingkat Kesadaran", value2: <p>{convertProfileData(record).tingkatKesadaran || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "denyutJantung", value1: "Denyut Jantung", value2: <p>{record.denyutJantung || "(Tidak ada kelainan/Tidak diperiksa)"} detak/menit</p> },
    { key: "pernapasan", value1: "Pernapasan", value2: <p>{record.pernapasan || "(Tidak ada kelainan/Tidak diperiksa)"} kali/menit</p> },
    { key: "tekananDarahSistole", value1: "Tekanan Darah Sistole", value2: <p>{record.tekananDarahSistole || "(Tidak ada kelainan/Tidak diperiksa)"} mmHg</p> },
    { key: "tekananDarahDiastole", value1: "Tekanan Darah Diastole", value2: <p>{record.tekananDarahDiastole || "(Tidak ada kelainan/Tidak diperiksa)"}  mmHg</p> },
    { key: "suhuTubuh", value1: "Suhu Tubuh", value2: <p>{record.suhuTubuh || "(Tidak ada kelainan/Tidak diperiksa)"} °C</p> },
    { key: "kepala", value1: "Kepala", value2: <p>{record.kepala || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "mata", value1: "Mata", value2: <p>{record.mata || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "telinga", value1: "Telinga", value2: <p>{record.telinga || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "hidung", value1: "Hidung", value2: <p>{record.hidung || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "rambut", value1: "Rambut", value2: <p>{record.rambut || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "bibir", value1: "Bibir", value2: <p>{record.bibir || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "gigiGeligi", value1: "Gigi Geligi", value2: <p>{record.gigiGeligi || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "lidah", value1: "Lidah", value2: <p>{record.lidah || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "langitLangit", value1: "Langit-langit", value2: <p>{record.langitLangit || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "leher", value1: "Leher", value2: <p>{record.leher || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "tenggorokan", value1: "Tenggorokan", value2: <p>{record.tenggorokan || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "tonsil", value1: "Tonsil", value2: <p>{record.tonsil || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "dada", value1: "Dada", value2: <p>{record.dada || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "payudara", value1: "Payudara", value2: <p>{record.payudara || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "punggung", value1: "Punggung", value2: <p>{record.punggung || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "perut", value1: "Perut", value2: <p>{record.perut || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "genital", value1: "Genital", value2: <p>{record.genital || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "anusDubur", value1: "Anus/Dubur", value2: <p>{record.anusDubur || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "lenganAtas", value1: "Lengan Atas", value2: <p>{record.lenganAtas || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "lenganBawah", value1: "Lengan Bawah", value2: <p>{record.lenganBawah || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "jariTangan", value1: "Jari Tangan", value2: <p>{record.jariTangan || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "kukuTangan", value1: "Kuku Tangan", value2: <p>{record.kukuTangan || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "persendianTangan", value1: "Persendian Tangan", value2: <p>{record.persendianTangan || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "tungkaiAtas", value1: "Tungkai Atas", value2: <p>{record.tungkaiAtas || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "tungkaiBawah", value1: "Tungkai Bawah", value2: <p>{record.tungkaiBawah || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "jariKaki", value1: "Jari Kaki", value2: <p>{record.jariKaki || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "kukuKaki", value1: "Kuku Kaki", value2: <p>{record.kukuKaki || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "persendianKaki", value1: "Persendian Kaki", value2: <p>{record.persendianKaki || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "statusPsikologis", value1: "Status Psikologis", value2: <p>{convertProfileData(record).statusPsikologis || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "statusPsikologisLainnya", value1: "Status Psikologis Lainnya", value2: <p>{record.statusPsikologisLainnya || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "sosialEkonomi", value1: "Sosial Ekonomi", value2: <p>{record.sosialEkonomi || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
    { key: "spiritual", value1: "Spiritual", value2: <p>{record.spiritual || "(Tidak ada kelainan/Tidak diperiksa)"}</p> },
  ];
  const patientDataProps4 = [
    {key: "namaObat", value1: "Nama Obat", value2: <p>{record.namaObat || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "dosisObat", value1: "Dosis Obat", value2: <p>{record.dosisObat || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "waktuPenggunaanObat", value1: "Waktu Penggunaan Obat", value2: <p>{record.waktuPenggunaanObat || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "diagnosisAwal", value1: "Diagnosis Awal / Masuk", value2: <p>{record.diagnosisAwal || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "diagnosisAkhirPrimer", value1: "Diagnosis Akhir Primer", value2: <p>{record.diagnosisAkhirPrimer || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "diagnosisAkhirSekunder", value1: "Diagnosis Akhir Sekunder", value2: <p>{record.diagnosisAkhirSekunder || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "namaKerabat", value1: "Nama Kerabat Pendamping Pasien", value2: <p>{record.namaKerabat || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "dokterPenjelasanTindakan", value1: "Dokter yang Memberi Penjelasan", value2: <p>{record.dokterPenjelasanTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "petugasPendampingTindakan", value1: "Petugas yang Mendampingi", value2: <p>{record.petugasPendampingTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "namaTindakan", value1: "Tindakan yang Dilakukan", value2: <p>{record.namaTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "konfirmasiTindakan", value1: "Persetujuan / Penolakan Tindakan", value2: <p>{convertProfileData(record).konfirmasiTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "tanggalPenjelasanTindakan", value1: "Tanggal Pemberian Penjelasan Tindakan", value2: <p>{record.tanggalPenjelasanTindakan}</p>},
    {key: "pasienPenjelasanTindakan", value1: "Pasien/Keluarga yang Menerima Penjelasan", value2: <p>{record.pasienPenjelasanTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "saksi1PenjelasanTindakan", value1: "Saksi 1", value2: <p>{record.saksi1PenjelasanTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
    {key: "saksi2PenjelasanTindakan", value1: "Saksi 2", value2: <p>{record.saksi2PenjelasanTindakan || '(Tidak ada kelainan/Tidak diperiksa)'}</p>},
  ];
  return (
    <div className="col-span-4 p-8">
      <div className="grid grid-cols-4 p-4 gap-x-16">
        <div className="col-span-4 my-12 mt-4 text-center text-gray-900">
          <h1 className="text-xl font-medium">Rekam Medis Elektronik Pasien</h1>
          <p>ID Pendaftaran:  <Tag color="green" className="m-0">{record.appointmentId}</Tag></p>
        </div>

        {/* Kiri */}
        <div className="grid content-start grid-cols-2 col-span-2 gap-x-4">
          {/* DATA PASIEN */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Data Pasien
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <PatientRecordLoop data={patientDataProps1} />
          {/* PEMERIKSAAN AWAL */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Pemeriksaan Awal
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <PatientRecordLoop data={patientDataProps3} />
        </div>

        {/* Kanan */}
        <div className="grid content-start grid-cols-2 col-span-2 gap-x-4">
          {/* INFORMASI UMUM */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Informasi Umum
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <PatientRecordLoop data={patientDataProps2} />
          {/* PEMERIKSAAN SPESIALISTIK */}
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Pemeriksaan Spesialistik
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <PatientRecordLoop data={patientDataProps4} />
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Lampiran Berkas
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <div id="lampiran" className="flex flex-wrap w-full col-span-2 gap-4"></div>
        </div>
        {/* <div className="mb-6 text-lg text-gray-900">
          Terapi
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <PatientRecordLoop data={patientDataProps5} /> */}
      </div>
    </div>
  );
}

export default PatientRecordDisplay;
