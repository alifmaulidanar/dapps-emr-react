/* eslint-disable react/prop-types */
import { Tag } from "antd";

const formatDateTime = (dateTime) => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const formattedDate = new Date(dateTime).toLocaleString('id-ID', options);
  return formattedDate.replace(',', '');
};

function convertData(data) {
  const convertedData = {...data};
  const merokokMap = {'0': 'Tidak', '1': 'Ya'}
  const alkoholMap = {'0': 'Tidak', '1': 'Ya'}
  const sayurBuahMap = {'0': 'Tidak', '1': 'Ya'}
  const statusHamilMap = {'0': 'Tidak', '1': 'Ya'}
  const tingkatKesadaranMap = {'1': 'Compos Mentis', '2': 'Somnolen', '3': 'Sopor', '4': 'Coma'}
  const alatBantuMap = {'0': 'Tidak', '1': 'Ya'}
  const kendalaKomunikasiMap = {'0': 'Tidak', '1': 'Ya'}
  const perawatRumahMap = {'0': 'Tidak', '1': 'Ya'}
  const bantuanOrangLainMap = {'0': 'Tidak', '1': 'Ya'}
  const ekspresiDanEmosiMap = {'1': 'Tenang', '2': 'Cemas', '3': 'Takut', '4': 'Gelisah', '5': 'Sedih', '6': 'Marah'}
  const bahasaMap = {'1': 'Indonesia', '2': 'Daerah', '3': 'Lainnya'}
  const tinggalBersamaMap = {'1': 'Sendiri', '2': 'Suami/Istri', '3': 'Orang tua', '4': 'Lainnya'}
  const sosialEkonomiMap = {'1': 'Baik', '2': 'Cukup', '3': 'Kurang'}
  const statusEkonomiMap = {'1': 'Baik', '2': 'Cukup', '3': 'Kurang'}
  const jaminanPengobatanMap = {'1': 'BPJS', '2': 'Umum/Mandiri'}
  const gangguanJiwaLampauMap = {'0': 'Tidak', '1': 'Ya'}
  const hubunganKeluargaMap = {'1': 'Harmonis', '2': 'Kurang Harmonis', '3': 'Tidak Harmonis', '4': 'Konflik Besar'}
  const nyeriTubuhMap = {'0': 'Tidak', '1': 'Ya'}
  const kualitasNyeriMap = {'1': 'Tekanan', '2': 'Terbakar', '3': 'Melilit', '4': 'Tertusuk', '5': 'Diiris', '6': 'Mencengkram'}
  const waktuNyeriMap = {'1': 'Intermiten', '2': 'Hilang Timbul'}
  const agamaMap = {'1': 'Islam', '2': 'Kristen (Protestan)', '3': 'Katolik', '4': 'Hindu', '5': 'Budha', '6': 'Konghuchu', '7': 'Penghayat', '8': 'Lain-lain'}
  const pekerjaanMap = {'0': 'Tidak bekerja', '1': 'PNS', '2': 'TNI/POLRI', '3': 'BUMN', '4': 'Pegawai Swasta/Wirausaha', '5': 'Lain-lain'}
  const pernikahanMap = {'1': 'Belum kawin', '2': 'Kawin', '3': 'Cerai Hidup', '4': 'Cerai Mati'}

  convertedData.merokok = merokokMap[convertedData.merokok]
  convertedData.konsumsiAlkohol = alkoholMap[convertedData.konsumsiAlkohol]
  convertedData.kurangSayurBuah = sayurBuahMap[convertedData.kurangSayurBuah]
  convertedData.statusHamil = statusHamilMap[convertedData.statusHamil]
  convertedData.tingkatKesadaran = tingkatKesadaranMap[convertedData.tingkatKesadaran]
  convertedData.alatBantu = alatBantuMap[convertedData.alatBantu]
  convertedData.kendalaKomunikasi = kendalaKomunikasiMap[convertedData.kendalaKomunikasi]
  convertedData.perawatRumah = perawatRumahMap[convertedData.perawatRumah]
  convertedData.bantuanOrangLain = bantuanOrangLainMap[convertedData.bantuanOrangLain]
  convertedData.ekspresiDanEmosi = ekspresiDanEmosiMap[convertedData.ekspresiDanEmosi]
  convertedData.bahasa = bahasaMap[convertedData.bahasa]
  convertedData.tinggalBersama = tinggalBersamaMap[convertedData.tinggalBersama]
  convertedData.sosialEkonomi = sosialEkonomiMap[convertedData.sosialEkonomi]
  convertedData.statusEkonomi = statusEkonomiMap[convertedData.statusEkonomi]
  convertedData.jaminanPengobatan = jaminanPengobatanMap[convertedData.jaminanPengobatan]
  convertedData.gangguanJiwaLampau = gangguanJiwaLampauMap[convertedData.gangguanJiwaLampau]
  convertedData.hubunganKeluarga = hubunganKeluargaMap[convertedData.hubunganKeluarga]
  convertedData.nyeriTubuh = nyeriTubuhMap[convertedData.nyeriTubuh]
  convertedData.kualitasNyeri = kualitasNyeriMap[convertedData.kualitasNyeri]
  convertedData.waktuNyeri = waktuNyeriMap[convertedData.waktuNyeri]
  convertedData.agama = agamaMap[convertedData.agama]
  convertedData.pekerjaan = pekerjaanMap[convertedData.pekerjaan]
  convertedData.pernikahan = pernikahanMap[convertedData.pernikahan]

  return convertedData;
}

const PatientRecordLoop = ({ data }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody>
          {data.map(({ key, value1, value2 }) => (
            <tr key={key} className="bg-white">
              <td className="py-2 text-sm text-gray-900">{value1}</td>
              <td className="py-2 text-sm text-gray-900">:</td>
              <td className="py-2 text-sm text-gray-900">{value2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AnamnesisRecordLoop = ({ data }) => {
  const headers = ['No.', 'Tanggal', 'Dokter/Tenaga Medis', 'Perawat', 'Keluhan Utama', 'Keluhan Tambahan','Lama Sakit', 'Merokok', 'Alkohol', 'Kurang Sayur/Buah', 'Edukasi', 'Terapi', 'Rencana Tindakan', 'Observasi', 'Biopsikososial', 'Keterangan'];
  const anamnesisData = [
    data.appointmentCreatedAt,
    data.namaDokter,
    data.namaAsisten,
    data.keluhanUtama,
    data.keluhanTambahan,
    `${data.lamaSakitTahun} tahun ${data.lamaSakitBulan} bulan ${data.lamaSakitHari} hari`,
    convertData(data).merokok,
    convertData(data).konsumsiAlkohol,
    convertData(data).kurangSayurBuah,
    data.edukasi,
    data.terapi,
    data.rencanaTindakan,
    data.observasi,
    data.biopsikososial,
    data.keteranganLainnya,
  ];

  let counter = 1;
  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="py-2 text-center text-sm text-gray-900 border border-gray-300">{counter++}</td>
            {anamnesisData.map((value, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 border border-gray-300">{value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const RiwayatPenyakitLoop = ({ data }) => {
  const headers = ['Jenis Riwayat Penyakit', 'Riwayat Penyakit Pasien'];
  const riwayatPenyakitData = [
    { jenisRiwayat: 'RPS', riwayatPasien: data.rps },
    { jenisRiwayat: 'RPD', riwayatPasien: data.rpd },
    { jenisRiwayat: 'RPK', riwayatPasien: data.rpk },
  ];
  const filteredRiwayatPenyakitData = riwayatPenyakitData.filter(row => row.riwayatPasien !== '');

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRiwayatPenyakitData.length > 0 ? (
            filteredRiwayatPenyakitData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="p-2 text-sm text-gray-900 border border-gray-200">{row.jenisRiwayat}</td>
                <td className="p-2 text-sm text-gray-900 border border-gray-200">{row.riwayatPasien}</td>
              </tr>
            ))
          ) : (
            <tr className="bg-white">
              <td className="p-4 text-sm text-gray-900 border border-gray-200"></td>
              <td className="p-4 text-sm text-gray-900 border border-gray-200"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const RiwayatAlergiLoop = ({ data }) => {
  const headers = ['Jenis Alergi', 'Alergi'];
  const riwayatAlergiData = [
    { jenisAlergi: 'Obat', riwayatAlergi: data.alergiObat },
    { jenisAlergi: 'Makanan', riwayatAlergi: data.alergiMakanan },
    { jenisAlergi: 'Lainnya', riwayatAlergi: data.alergiLainnya },
  ];
  const filteredRiwayatAlergiData = riwayatAlergiData.filter(row => row.riwayatAlergi !== '');

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRiwayatAlergiData.length > 0 ? (
            filteredRiwayatAlergiData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="p-2 text-sm text-gray-900 border border-gray-200">{row.jenisAlergi}</td>
                <td className="p-2 text-sm text-gray-900 border border-gray-200">{row.riwayatAlergi}</td>
              </tr>
            ))
          ) : (
            <tr className="bg-white">
              <td className="p-4 text-sm text-gray-900 border border-gray-200"></td>
              <td className="p-4 text-sm text-gray-900 border border-gray-200"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const StatusFisisRecordLoop = ({ data }) => {
  console.log({patient})
  const headers = ['No.', 'Apakah menggunakan alat bantu saat beraktivitas', 'Agama/Kepercayaan', 'Adakah Kendala Komunikasi', 'Adakah yang merawat dirumah', 'Apakah membutuhkan bantuan orang lain saat beraktivitas','Ekspresi dan Emosi', 'Bahasa yang digunakan', 'Pekerjaan', 'Tinggal dengan', 'Sosial ekonomi', 'Jaminan', 'Gangguan jiwa dimasa lalu', 'Status Perkawinan', 'Status ekonomi', 'Hubungan dengan keluarga'];
  const anamnesisData = [
    convertData(data).alatBantu,
    convertData(patient).agama,
    convertData(data).kendalaKomunikasi,
    convertData(data).perawatRumah,
    convertData(data).bantuanOrangLain,
    convertData(data).ekspresiDanEmosi,
    convertData(data).bahasa,
    convertData(patient).pekerjaan,
    convertData(data).tinggalBersama,
    convertData(data).sosialEkonomi,
    convertData(data).jaminanPengobatan,
    convertData(data).gangguanJiwaLampau,
    convertData(patient).pernikahan,
    convertData(data).statusEkonomi,
    convertData(data).hubunganKeluarga,
  ];

  let counter = 1;
  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="py-2 text-center text-sm text-gray-900 border border-gray-300">{counter++}</td>
            {anamnesisData.map((value, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 border border-gray-300">{value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PemeriksaanFisikRecordLoop = ({ data }) => {
  const headers = ['No.', 'Tanggal', 'Dokter/Tenaga Medis', 'Perawat', 'Status Hamil', 'Kesadaran','Sistole', 'Diastole', 'MAP', 'Tinggi Badan', 'Berat Badan', 'Detak Nadi', 'Pernapasan', 'Saturasi (Sp02)', 'Suhu'];
  const anamnesisData = [
    data.appointmentCreatedAt,
    data.namaDokter,
    data.namaAsisten,
    convertData(data).statusHamil,
    convertData(data).tingkatKesadaran,
    data.tekananDarahSistole,
    data.tekananDarahDiastole,
    data.map,
    data.tinggiBadan,
    data.beratBadan,
    data.detakNadi,
    data.pernapasan,
    data.saturasi,
    data.suhuTubuh,
  ];

  let counter = 1;
  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="py-2 text-center text-sm text-gray-900 border border-gray-300">{counter++}</td>
            {anamnesisData.map((value, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 border border-gray-300">{value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const AsesmenNyeriRecordLoop = ({ data }) => {
  const headers = ['No.', 'Apakah pasien merasakan nyeri?', 'Pencetus', 'Kualitas', 'Lokasi', 'Skala Nyeri','Waktu'];
  const anamnesisData = [
    convertData(data).nyeriTubuh,
    data.pencetusNyeri,
    convertData(data).kualitasNyeri,
    data.lokasiNyeri,
    data.skalaNyeri,
    convertData(data).waktuNyeri
  ];

  let counter = 1;
  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            <td className="py-2 text-center text-sm text-gray-900 border border-gray-300">{counter++}</td>
            {anamnesisData.map((value, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 border border-gray-300">{value}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const DetailPemeriksaanFisikRecordLoop = ({ data }) => {
  const headers = ['Pemeriksaan', 'Keterangan'];
  const pemeriksaan = [
    'Pemeriksaan Kulit',
    'Pemeriksaan Kuku',
    'Pemeriksaan Kepala',
    'Pemeriksaan Wajah',
    'Pemeriksaan Mata',
    'Pemeriksaan Telinga',
    'Pemeriksaan Hidung dan Sinus',
    'Pemeriksaan Mulut dan Bibir',
    'Pemeriksaan Leher',
    'Pemeriksaan Dada dan Punggung',
    'Pemeriksaan Kardiovaskuler',
    'Pemeriksaan Dada dan Aksila',
    'Pemeriksaan Abdomen Perut',
    'Pemeriksaan Ekstermitas Atas (Bahu, Siku, Tangan)',
    'Pemeriksaan Ekstermitas Bawah (Panggul, Lutut, Pergelangan Kaki dan Telapak Kaki)',
    'Pemeriksaan Genitalia Wanita'
  ];
  const pemeriksaanData = [
    data.pemeriksaanKulit,
    data.pemeriksaanKuku,
    data.pemeriksaanKepala,
    data.pemeriksaanWajah,
    data.pemeriksaanMata,
    data.pemeriksaanTelinga,
    data.pemeriksaanHidungSinus,
    data.pemeriksaanMulutBibir,
    data.pemeriksaanLeher,
    data.pemeriksaanDadaPunggung,
    data.pemeriksaanKardiovaskuler,
    data.pemeriksaanDadaAksila,
    data.pemeriksaanAbdomenPerut,
    data.pemeriksaanEkstermitasAtas,
    data.pemeriksaanEkstermitasBawah,
    data.pemeriksaanGenitaliaWanita
  ];
  const defaultDescriptions = {
    pemeriksaanKulit: "• Inspeksi: Normal; kulit tidak ada ikterik/pucat/sianosis\n• Palpasi: Normal; lembab, turgor baik/elastik, tidak ada edema",
    pemeriksaanKuku: "• Inspeksi: Normal; bersih, bentuk normal tidak ada tanda-tanda jari tabuh (clubbing finger), tidak ikterik/sianosis\n• Palpasi: Normal; aliran darah kuku akan kembali < 3 detik",
    pemeriksaanKepala: "• Inspeksi: Normal; simetris, bersih, tidak ada lesi, tidak menunjukkan tanda-tanda kekurangan gizi (rambut jagung dan kering)\n• Palpasi: Normal; tidak ada peyokan/pembengkakan, rambut lebat dan kuat/tidak rapuh",
    pemeriksaanWajah: "• Inspeksi: Normal; warna sama dengan bagian tubuh lain, tidak pucat/ikterik, simetris\n• Palpasi: Normal; tidak ada nyeri tekan dan edema",
    pemeriksaanMata: "• Inspeksi: Normal; simetris mata kika, simetris bola mata kika, warna konjungtiva pink, dan sclera berwarna putih",
    pemeriksaanTelinga: "• Inspeksi: Normal; bentuk dan posisi simetris kika, integritas kulit bagus, warna sama dengan kulit lain, tidak ada tanda-tanda infeksi, dan alat bantu dengar\n• Palpasi: Normal; tidak ada nyeri tekan",
    pemeriksaanHidungSinus: "• Inspeksi: Normal; simetris kika, warna sama dengan warna kulit lain, tidak ada lesi, tidak ada sumbatan, perdarahan dan tanda-tanda infeksi\n• Palpasi dan Perkusi: Normal; tidak ada bengkak dan nyeri tekan",
    pemeriksaanMulutBibir: "• Inspeksi dan Palpasi Struktur Luar: Normal; warna mukosa mulut dan bibir pink, lembab, tidak ada lesi dan stomatitis\n• Inspeksi dan Palpasi Struktur Dalam: Normal; gigi lengkap, tidak ada tanda-tanda gigi berlubang atau kerusakan gigi, lidah simetris, warna pink, langit-langit utuh dan tidak ada tanda infeksi",
    pemeriksaanLeher: "• Inspeksi Leher: Normal; warna sama dengan kulit lain, integritas kulit baik, bentuk simetris\n• Inspeksi dan Auskultasi Arteri Karotis: Normal; arteri karotis vertebralis normal\n• Inspeksi dan Palpasi Kelenjer Tiroid: Normal; tidak teraba pembesaran kelenjer gondok, tidak ada pembesaran kelenjer limfe, tidak ada nyeri\n• Auskultasi (Bising Pembuluh Darah): Normal",
    pemeriksaanDadaPunggung: "• Inspeksi: Normal; simetris, bernapas dengan normal, tidak ada tanda-tanda distress pernapasan, warna kulit sama dengan warna kulit lain, tidak ada ikterik/sianosis, tidak ada pembengkakan/penonjolan/pembengkakan\n• Palpasi: Normal; integritas kulit baik, tidak ada nyeri tekan/massa/tanda-tanda peradangan, ekspansi simetris, taktil fremitus cenderung sebelah kanan lebih teraba jelas\n• Perkusi: Normal; resonan (tidak ada pekak/hiperresonan, suara udara = pekak (bleg bleg), jika bagian udara lebih besar dari bagian padat=hiperresonan (deng deng deng), batas jantung-bunyi hilang\n• Auskultasi: Normal; bunyi nafas vesikuler, bronkovesikuler, bronkhial, tracheal",
    pemeriksaanKardiovaskuler: "• Inspeksi: Normal; denyutan aorta teraba\n• Palpasi: Normal; denyutan aorta teraba\n• Perkusi: Normal; batas jantung kiri 4,7,10 cm ke arah kiri dari garis mid sterna, pada RIC 4,5, dan 8\n• Auskultasi: Normal; terdengar bunyi jantung I/S1 (lub) dan bunyi jantung II/S2 (dub), tidak ada bunyi jantung tambahan (S3 atau S4)",
    pemeriksaanDadaAksila: "• Inspeksi Dada: Normal\n• Palpasi Dada: Normal\n• Inspeksi dan Palpasi Aksila: Normal",
    pemeriksaanAbdomenPerut: "• Inspeksi: Normal; simetris kika, warna dengan warna kulit lain, tidak ikterik tidak terdapat ostomy, distensi, tonjolan, pelebaran vena, kelainan umbilicus\n• Auskultasi: Normal; suara peristaltik terdengar setiap 5-20x/dtk, terdengar denyutan arteri renalis, arteri iliaka dan aorta\n• Perkusi Semua Kuadran: Normal; tidak ada nyeri tekan, tidak ada massa dan penumpukan cairan\n• Perkusi Hepar: Normal\n• Perkusi Limfa: Normal\n• Perkusi Ginjal: Normal\n• Palpasi Semua Kuadran: Normal",
    pemeriksaanEkstermitasAtas: "• Inspeksi Struktur Muskuloskeletal: Normal; simetris kika, integritas kulit baik, ROM aktif, kekuatan otot penuh\n• Palpasi: Normal; teraba jelas\n• Tes Refleks: Normal; refleks biseps dan triseps positif",
    pemeriksaanEkstermitasBawah: "• Inspeksi Struktur Muskuloskeletal: Normal; simetris kika, integritas kulit baik, ROM aktif, kekuatan otot penuh\n• Palpasi: Normal; teraba jelas\n• Tes Refleks: Normal; refleks patella dan achilles positif",
    pemeriksaanGenitaliaWanita: "• Inspeksi Genitalia Eksternal: Normal; bersih, mukosa lembab, integritas kulit baik, simetris tidak ada edema dan tanda-tanda infeksi (pengeluaran pus/bau)\n• Inspeksi Vagina dan Serviks: Normal\n• Palpasi Vagina, Uterus dan Ovarium: Normal\n• Pemeriksaan Anus dan Rectum: Normal; tidak ada nyeri, tidak terdapat edema/hemoroid/polip/tanda-tanda infeksi dan pendarahan"
  };
  const formatKey = (item) => {
    return item
      .replace(/Pemeriksaan /, 'pemeriksaan')
      .replace(/ dan /g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/ /g, '');
  };

  return (
    <div className="w-full">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {pemeriksaan.map((item, index) => {
            const key = formatKey(item);
            const description = pemeriksaanData[index] ? pemeriksaanData[index] : defaultDescriptions[key];

            return (
              <tr key={index} className="bg-white">
                <td className="p-2 text-sm text-gray-900 border border-gray-300">{item}</td>
                <td className="p-2 text-sm text-gray-900 border border-gray-300">{description}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DiagnosaRecordLoop = ({ data }) => {
  const headers = ['No.', 'Tanggal', 'Dokter/Tenaga Medis', 'Perawat', 'ICD-X', 'Diagnosa', 'Jenis', 'Kasus'];
  const { diagnosis } = data;

  let counter = 1;
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-collapse">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <td key={index} className="p-2 text-sm text-gray-900 bg-sky-100 text-center border border-gray-300">{header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {diagnosis.map((diag, index) => (
            <tr key={index} className="bg-white">
              <td className="py-2 text-center text-sm text-gray-900 border border-gray-300">{counter++}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{formatDateTime(data.diagnosisCreatedAt)}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.namaDokterDiagnosis}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.namaAsistenDiagnosis}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.icdx}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.diagnosis}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.jenisDiagnosis}</td>
              <td className="p-2 text-sm text-gray-900 border border-gray-300">{diag.kasusDiagnosis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

let patient;
function PatientRecordDisplay({ record, chosenPatient, appointmentData }) {
  patient = chosenPatient;
  // useEffect(() => {
  //   if (record.lampiranRekamMedis) {
  //     fetch(`${CONN.IPFS_LOCAL}/${record.lampiranRekamMedis}`)
  //     .then(response => response.json())
  //     .then(bundleContent => {
  //         const root = createRoot(document.getElementById("lampiran"));
  //         const cards = bundleContent.map(fileData => {
  //           const blob = new Blob([new Uint8Array(fileData.content.data)]);
  //           const url = URL.createObjectURL(blob);
  //           let attachmentElement;
  //           let previewElement;
  //           if (fileData.path.endsWith('.png') || fileData.path.endsWith('.jpg') || fileData.path.endsWith('.jpeg')) {
  //             // Display image file
  //             attachmentElement = document.createElement('img');
  //             attachmentElement.src = url;
  //             attachmentElement.alt = fileData.path;
  //             previewElement = <img alt={fileData.path} src={url} style={{ width: '28px', height: 'auto' }} />;
  //           } else {
  //             // Display other file types as download links
  //             attachmentElement = document.createElement('img');
  //             attachmentElement.src = url;
  //             attachmentElement.alt = fileData.path;
  //             previewElement = <FileOutlined style={{ fontSize: '28px' }} />;
  //           }
  //           const fileName = fileData.path.split('.').slice(0, -1).join('.');
  //           const fileExtension = fileData.path.split('.').pop();
  //           const cardContent = (
  //             <>
  //               {previewElement}
  //             </>
  //           );
  //           return (
  //             <Card key={fileData.path} className="w-[115px] h-fit hover:shadow">
  //               <a href={url} download={fileData.path} className="grid justify-items-center gap-y-2 hover:text-gray-900">
  //                 {cardContent}
  //                 <p>{fileName}.{fileExtension}</p>
  //               </a>
  //             </Card>
  //           );
  //         });
  //         root.render(cards, document.createElement('div'));
  //       })
  //       .catch(error => {
  //         console.error('Error fetching data:', error);
  //       });
  //   }
  // }, [record.lampiranRekamMedis]);

  function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (dayDifference < 0) {
      age--;
      today.setMonth(today.getMonth() - 1);
    }
    if (monthDifference < 0) age--;
    const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
    const days = today.getDate() < birthDate.getDate() ? birthDate.getDate() - today.getDate() : today.getDate() - birthDate.getDate();
    return `${age} tahun ${months} bulan ${days} hari`;
  }

  function convertProfileData(state) {
    const convertedState = {...state};
    const jaminanPengobatanMap = {'1': 'BPJS', '2': 'Umum / Mandiri'}
    const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
    const golonganDarahMap = { '1': 'A', '2': 'B', '3': 'AB', '4': 'O', '5': 'A+', '6': 'A-', '7': 'B+', '8': 'B-', '9': 'AB+', '10': 'AB-', '11': 'O+', '12': 'O-', '13': 'Tidak tahu' };
    // const agamaMap = { '1': 'Islam', '2': 'Kristen (Protestan)', '3': 'Katolik', '4': 'Hindu', '5': 'Budha', '6': 'Konghuchu', '7': 'Penghayat', '8': 'Lain-lain' };
    // const pendidikanMap = { '0': 'Tidak sekolah', '1': 'SD', '2': 'SLTP sederajat', '3': 'SLTA sederajat', '4': 'D1-D3 sederajat', '5': 'D4', '6': 'S1', '7': 'S2', '8': 'S3' };
    // const pekerjaanMap = { '0': 'Tidak Bekerja', '1': 'PNS', '2': 'TNI/POLRI', '3': 'BUMN', '4': 'Pegawai Swasta/Wirausaha', '5': 'Lain-lain' };
    // const pernikahanMap = { '1': 'Belum Kawin', '2': 'Kawin', '3': 'Cerai Hidup', '4': 'Cerai Mati' };
    convertedState.jaminanPengobatan = jaminanPengobatanMap[convertedState.jaminanPengobatan]
    convertedState.gender = genderMap[convertedState.gender];
    convertedState.golonganDarah = golonganDarahMap[convertedState.golonganDarah];
    convertedState.genderKerabat = genderMap[convertedState.genderKerabat];
    convertedState.tanggalLahir = convertedState.tanggalLahir ? new Date(convertedState.tanggalLahir).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    convertedState.tanggalTerpilih = convertedState.tanggalTerpilih ? new Date(convertedState.tanggalTerpilih).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    convertedState.tanggalLahirKerabat = convertedState.tanggalLahirKerabat ? new Date(convertedState.tanggalLahirKerabat).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    return convertedState;
  }
  const dataPasienKiri = [
    { key: "appointmentId", value1: "ID Pendaftaran", value2: <p>{record.appointmentId}</p> },
    { key: "newIndexString", value1: "Nomor Antrean", value2: <p>{record.newIndexString}</p> },
    { key: "instalasi", value1: "Instalasi", value2: <p>Rawat Jalan</p> },
    { key: "tanggalTerpilih", value1: "Tanggal Pelayanan", value2: <p>{convertProfileData(record).tanggalTerpilih}</p> },
    { key: "waktuTerpilih", value1: "Waktu Pelayanan", value2: <p>{record.waktuTerpilih}</p> },
    { key: "spesialisasiDokter", value1: "Poli/Ruangan", value2: <p>{record.spesialisasiDokter}</p> },
    { key: "namaDokter", value1: "Nama Dokter", value2: <p>{record.namaDokter}</p> },
    { key: "namaAsisten", value1: "Nama Asisten", value2: <p>{record.namaAsisten}</p> },
    { key: "jaminanPengobatan", value1: "Jaminan Pengobatan", value2: <p>{convertProfileData(record.anamnesis).jaminanPengobatan}</p> },
    { key: "faskesAsal", value1: "Nama Faskes", value2: <p>{record.faskesAsal}</p> },
  ];
  const dataPasienKanan = [
    { key: "nomorIdentitas", value1: "NIK", value2: <p>{chosenPatient.nomorIdentitas}</p>},
    { key: "dmrNumber", value1: "Nomor DRM", value2: <p>{chosenPatient.dmrNumber}</p>},
    { key: "emrNumber", value1: "Nomor RME", value2: <p>{chosenPatient.emrNumber}</p>},
    { key: "namaLengkap", value1: "Nama Lengkap Pasien", value2: <p>{chosenPatient.namaLengkap}</p> },
    { key: "namaIbu", value1: "Nama Ibu", value2: <p>{chosenPatient.namaIbu}</p> },
    { key: "gender", value1: "Jenis Kelamin", value2: <p>{convertProfileData(chosenPatient).gender}</p> },
    { key: "tanggalLahir", value1: "Tempat, Tanggal Lahir", value2: <p>{`${chosenPatient.tempatLahir}, ` || ''}{convertProfileData(chosenPatient).tanggalLahir || '-'}</p> },
    { key: "umur", value1: "Umur", value2: <p>{calculateAge(chosenPatient.tanggalLahir)}</p> },
    { key: "alamat", value1: "Alamat", value2: <p>{chosenPatient.alamat}</p> },
    { key: "nomorTelepon", value1: "Nomor Telepon", value2: <p>{chosenPatient.nomorTelepon}</p> },
  ];

  // const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.';
  // collapsible data
  // const items = [
  //   {
  //     key: '1',
  //     label: 'This is panel header 1',
  //     children: <p>{text}</p>,
  //   },
  //   {
  //     key: '2',
  //     label: 'This is panel header 2',
  //     children: <p>{text}</p>,
  //   },
  //   {
  //     key: '3',
  //     label: 'This is panel header 3',
  //     children: <p>{text}</p>,
  //   },
  // ];

  console.log({chosenPatient})
  console.log({record});
  return (
    <div className="col-span-4 p-8">
      <div className="grid grid-cols-4 p-4 gap-x-16">
        <div className="col-span-4 my-12 mt-4 text-center text-gray-900">
          <h1 className="text-xl font-medium">Rekam Medis Elektronik Pasien</h1>
          <p>ID Pendaftaran:  <Tag color="green" className="m-0">{record.appointmentId}</Tag></p>
        </div>

        {/* COLLAPSE */}
        {/* <div className="col-span-4 my-12 mt-4 text-gray-900">
        <Collapse size='large' items={items} defaultActiveKey={['1']} />
        </div> */}

        {/* DATA PASIEN */}
        <div className="col-span-4 mb-6 text-lg text-gray-900">
          Data Pasien
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <div className="col-span-2">
          <PatientRecordLoop data={dataPasienKiri} />
        </div>
        <div className="col-span-2">
          <PatientRecordLoop data={dataPasienKanan} />
        </div>
        {/* DATA PASIEN */}

        {/* DATA ANAMNESIS */}
        <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data Anamnesis
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>

        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Anamnesis</p>
          <AnamnesisRecordLoop data={record.anamnesis} />
        </div>
        <div className="col-span-4 my-4 grid grid-cols-2 gap-x-12">
          <div>
            <p className="font-semibold pb-2">Riwayat Penyakit</p>
            <RiwayatPenyakitLoop data={record.anamnesis} />
          </div>
          <div>
            <p className="font-semibold pb-2">Riwayat Alergi</p>
            <RiwayatAlergiLoop data={record.anamnesis} />
          </div>
          {/* <AnamnesisRecordLoop data={record.anamnesis} /> */}
        </div>

        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Status Fisis/Neurobiologis/Mental, Biologis, Psikososialspiritual, dan Ekonomi</p>
          <StatusFisisRecordLoop data={record.anamnesis} />
        </div>
        {/* DATA ANAMNESIS */}

        {/* DATA PEMERIKSAAN FISIK */}
        {/* <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data Pemeriksaan Fisik
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div> */}
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Pemeriksaan Fisik</p>
          <PemeriksaanFisikRecordLoop data={record.anamnesis} />
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Asesmen Nyeri</p>
          <AsesmenNyeriRecordLoop data={record.anamnesis} />
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Detail Pemeriksaan Fisik</p>
          <DetailPemeriksaanFisikRecordLoop data={record.anamnesis} />
        </div>
        {/* DATA PEMERIKSAAN FISIK */}

        {/* DATA DIAGNOSA */}
        <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data Diagnosa
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Data Diagnosa</p>
          <DiagnosaRecordLoop data={record.diagnosis} />
        </div>
        {/* DATA DIAGNOSA */}

        {/* DATA Kehamilan */}
        <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data Kehamilan
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Data Kehamilan</p>
          <DiagnosaRecordLoop data={record.diagnosis} />
        </div>
        {/* DATA Kehamilan */}

        {/* DATA TB Paru */}
        <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data TB Paru
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Data TB Paru</p>
          <DiagnosaRecordLoop data={record.diagnosis} />
        </div>
        {/* DATA TB Paru */}

        {/* DATA Lab */}
        <div className="col-span-4 mt-8 text-lg text-gray-900">
          Data Lab
          <hr className="h-px bg-gray-700 border-0"></hr>
        </div>
        <div className="col-span-4 my-4">
          <p className="font-semibold pb-2">Data Lab</p>
          <DiagnosaRecordLoop data={record.diagnosis} />
        </div>
        {/* DATA Lab */}

        {/* <div className="grid content-start grid-cols-2 col-span-2 gap-x-4">
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Anamnesis
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>

          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Pemeriksaan Kehamilan
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
        </div> */}


        {/* Kanan */}
        {/* <div className="grid content-start grid-cols-2 col-span-2 gap-x-4">
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Laboratorium
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Diagnosis
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
          <div className="col-span-2 mb-6 text-lg text-gray-900">
            Pemeriksaan TB Paru
            <hr className="h-px bg-gray-700 border-0"></hr>
          </div>
        </div> */}
        {/* <div id="lampiran" className="flex flex-wrap w-full col-span-2 gap-4"></div> */}
      </div>
    </div>
  );
}

export default PatientRecordDisplay;
