function FormatDateTime(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} pukul ${hours}:${minutes}:${seconds}`;
}

function FormatDateTimeDash(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} pukul ${hours}:${minutes}:${seconds}`;
}

function FormatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function FormatDate2(dateString) {
  const dateParts = dateString.split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  return `${day}/${month}/${year}`;
}

function FormatDateDash(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function ConvertData(data) {
  const convertedData = {...data};
  const genderMap = { '0': 'Tidak diketahui', '1': 'Laki-laki', '2': 'Perempuan', '3': 'Tidak dapat ditentukan', '4': 'Tidak mengisi' };
  const statusPulangMap = {'1': 'Berobat Jalan', '2': 'Rujuk Internal', '3': 'Rujuk Lanjut', '4': 'Meninggal', '5': 'Batal Berobat'}
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
  const jenisDiagnosisMap = {'1': 'Primer', '2': 'Sekunder', '3': 'Komplikasi'}
  const kasusDiagnosisMap = {'1': 'Baru', '2': 'Lama'}
  const penolongPersalinan = {'1': 'Keluarga', '2': 'Dukun', '3': 'Bidan', '4': 'dr. Umum', '5': 'dr. Spesialis', '6': 'Lainnya', '7': 'Tidak ada'}
  const tempatPersalinan = {'1': 'Rumah', '2': 'Polides', '3': 'Pustu', '4': 'Puskesmas', '5': 'Klinik', '6': 'Rumah Bersalin (RB)', '7': 'Rumah Sakit Ibu dan Anak (RSIA)', '8': 'Rumah Sakit Orang Dengan HIV AIDS (RS ODHA)'}
  const pendampingPersalinan = {'1': 'Suami', '2': 'Keluarga', '3': 'Teman', '4': 'Tetangga', '5': 'Lainnya'}
  const transportasiPersalinan = {'1': 'Ambulans Desa', '2': 'Ambulans Puskesmas', '3': 'Ambulans Swasta', '4': 'Kendaraan Pribadi', '5': 'Kendaraan Umum'}
  const pendonorPersalinan = {'1': 'Suami', '2': 'Keluarga', '3': 'Teman', '4': 'Tetangga', '5': 'Lainnya'}
  const bukuKia = {'0': 'Tidak memiliki', '1': 'Memiliki'}
  const parutBcg = {'1': 'Jelas', '2': 'Tidak ada', '3': 'Meragukan'}
  const wanitaUsiaSubur = {'1': 'Hamil', '2': 'Tidak hamil'}
  const tipeDiagnosis = {'1': 'Terkontaminasi Bakteriologis', '2': 'Terdiagnosa klinis'}
  const klasifikasiByAnatomi = {'1': 'Paru', '2': 'Ekstra'}
  const klasifikasiByRiwayat = {'1': 'Baru', '2': 'Kambuh', '3': 'Diobati setelah gagal', '4': 'Diobati setelah putus berobat', '5': 'Riwayat tidak diketahui', '6': 'Lain-lain'}
  const klasifikasiByHiv = {'1': 'Positif', '2': 'Negatif', '3': 'Tidak diketahui'}
  const riwayatDm = {'1': 'Ya', '0': 'Tidak'}
  const tesDm = {'1': 'Positif', '2': 'Negatif'}
  const terapiDm = {'1': 'Obat Hipoglikemik Oral (OHO)', '2': 'Injeksi Insulin'}
  const hasilUjiSelainDahak = {'1': 'Mycobacterium Tuberculosis (MTB)', '2': 'Bukan MTB'}
  const hasilPengobatanTb = {'1': 'Sembuh', '2': 'Pengobatan selesai', '3': 'Gagal', '4': 'Meninggal', '5': 'Putus berobat', '6': 'Tidak dievaluasi'}
  const statusPemeriksaanLab = {'1': 'Urgent', '2': 'Tidak urgent'}

  convertedData.gender = genderMap[convertedData.gender];
  convertedData.statusPulang = statusPulangMap[convertedData.statusPulang]
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
  convertedData.jenisDiagnosis = jenisDiagnosisMap[convertedData.jenisDiagnosis]
  convertedData.kasusDiagnosis = kasusDiagnosisMap[convertedData.kasusDiagnosis]
  convertedData.penolongPersalinan = penolongPersalinan[convertedData.penolongPersalinan]
  convertedData.tempatPersalinan = tempatPersalinan[convertedData.tempatPersalinan]
  convertedData.pendampingPersalinan = pendampingPersalinan[convertedData.pendampingPersalinan]
  convertedData.transportasiPersalinan = transportasiPersalinan[convertedData.transportasiPersalinan]
  convertedData.pendonorPersalinan = pendonorPersalinan[convertedData.pendonorPersalinan]
  convertedData.bukuKia = bukuKia[convertedData.bukuKia]
  convertedData.parutBcg = parutBcg[convertedData.parutBcg]
  convertedData.wanitaUsiaSubur = wanitaUsiaSubur[convertedData.wanitaUsiaSubur]
  convertedData.tipeDiagnosis = tipeDiagnosis[convertedData.tipeDiagnosis]
  convertedData.klasifikasiByAnatomi = klasifikasiByAnatomi[convertedData.klasifikasiByAnatomi]
  convertedData.klasifikasiByRiwayat = klasifikasiByRiwayat[convertedData.klasifikasiByRiwayat]
  convertedData.klasifikasiByHiv = klasifikasiByHiv[convertedData.klasifikasiByHiv]
  convertedData.riwayatDm = riwayatDm[convertedData.riwayatDm]
  convertedData.tesDm = tesDm[convertedData.tesDm]
  convertedData.terapiDm = terapiDm[convertedData.terapiDm]
  convertedData.hasilUjiSelainDahak = hasilUjiSelainDahak[convertedData.hasilUjiSelainDahak]
  convertedData.hasilPengobatanTb = hasilPengobatanTb[convertedData.hasilPengobatanTb]
  convertedData.statusPemeriksaanLab = statusPemeriksaanLab[convertedData.statusPemeriksaanLab]

  return convertedData;
}

export { FormatDateTime, FormatDateTimeDash, FormatDate, FormatDate2, FormatDateDash, ConvertData };