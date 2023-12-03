# Struktur Data

## I. Lembar Pengesahan
### 1. Identitas Umum Pasien
```
Nama Lengkap                                           : string
Nomor Rekam Medis                                      : string    // sistem penomoran unit
Nomor Induk Kependudukan (NIK)                         : string    // 16 digit sesuai NIK / bila tidak ada 9999999999999999
Nomor Identitas Lain (Khusus WNA): Nomor Paspor / KITAS: string    
Nama Ibu Kandung                                       : string
Tempat Lahir                                           : string
Tanggal Lahir                                          : datetime  // DD/MM/YYY
Jenis Kelamin                                          : string    // 0. Tidak diketahui; 1. Laki-laki; 2. Perempuan; 3. Tidak dapat ditentukan; 4. Tidak mengisi
Agama                                                  : string    // 1. Islam; 2. Kristen (Protestan); 3. Katolik; 4. Hindu; 5. Budha; 6. Konghucu; 7. Penghayat; 8. Lain-lain (free text)
Suku                                                   : string    // free text
Bahasa yang Dikuasai                                   : string    // free text
Alamat Lengkap                                         : string
Rukun Tetangga / RT                                    : string    // numerik 3 digit
Rukun Warga / RW                                       : string    // numerik 3 digit
Kelurahan / Desa                                       : string    // numerik sesuai kode wilayah
Kecamatan                                              : string    // numerik sesuai kode wilayah
Kotamadya / Kabupaten                                  : string    // numerik sesuai kode wilayah
Kode Pos                                               : string    // numerik sesuai kode wilayah
Provinsi                                               : string    // numerik sesuai kode wilayah
Negara                                                 : string    // numerik sesuai kode wilayah / IS0 3166
Alamat Domisili                                        : string
Rukun Tetangga / RT                                    : string    // numerik 3 digit
Rukun Warga / RW                                       : string    // numerik 3 digit
Kelurahan / Desa Domisili                              : string    // numerik sesuai kode wilayah
Kecamatan                                              : string    // numerik sesuai kode wilayah
Kotamadya / Kabupaten                                  : string    // numerik sesuai kode wilayah
Kode Pos                                               : string    // numerik sesuai kode wilayah
Provinsi                                               : string    // numerik sesuai kode wilayah
Negara                                                 : string    // numerik sesuai kode wilayah / ISO 3166
Nomor Telepon Rumah / Tempat Tinggal                   : string    // +[kode negara]/[kode wilayah][nomor telepon]
Nomor Telepon Selular Pasien                           : string    // +[kode negara][nomor telepon]
Pendidikan                                             : string    // 0. Tidak sekolah; 1. SD; 2. SLTP sederajat; 3. SLTA sederajat; 4. D1-D3 sederajat; 5. D4; 6. S1; 7. S2; 8. S3
Pekerjaan                                              : string    // 0. Tidak bekerja; 1. PNS; 2. TNI/POLRI; 3. BUMN; 4. Pegawai Swasta/ Wirausaha; 5. Lain-lain (free text)
Status Pernikahan                                      : string    // 1. Belum Kawin; 2. Kawin; 3. Cerai Hidup; 4. Cerai Mati
```

### 2. Identitas Bayi Baru Lahir
```
Nama Bayi         : string
NIK Ibu Kandung   : string    // 16 digit sesuai NIK / bila tidak ada 10000000000000000
Nomor Rekam Medis : string
Tanggal Lahir Bayi: date      // DD/MM/YYYY
Jam Lahir         : time    // jam:menit:detik
Jenis Kelamin     : string    // 0. Tidak diketahui; 1. Laki-laki; 2. Perempuan; 3. Tidak dapat ditentukan 4. Tidak mengisi
```

## II. Cara Pembayaran
```
Cara Pembayaran: string    // 1. JKN; 2. Mandiri; 3. Asuransi lainnya (free text)
```

## III. General Consent
```
Tanggal                                               : date    // DD/MM/YYYY
Jam                                                   : time    // jam:menit:detik
Setiap Lembar/Formulir Tiap Layanan Terdapat Informasi: {
    Nama             : string
    Nomor Rekam Medis: string
    Tanggal Lahir    : datetime    // DD/MM/YYYY
    Jenis Kelamin    : string      // 1. Laki-laki; 2. Perempuan
}
Persetujuan Pasien                                    : {
    Informasi Ketentuan Pembayaran             : boolean    // Setuju/Tidak Setuju
    Informasi tentang Hak dan Kewajiban Pasien : boolean    // Setuju/Tidak Setuju
    Informasi tentang Tata Tertib RS           : boolean    // Setuju/Tidak Setuju
    Kebutuhan Penterjemah Bahasa               : boolean    // Ya/Tidak
    Kebutuhan Rohaniawan                       : boolean    // Ya/Tidak
    Pelepasan Informasi / Kerahasiaan Informasi: {
        
    }
}
```











