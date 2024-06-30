import Navbar from "./Navbar";

function NavbarController({ type, page, color, accountData = null }) {
  const title = "Puskesmas";
  let navItems = [];
  let buttons = [];
  const defaultColor = "gray";

  // Tentukan tipe navbar berdasarkan nilai prop 'type'
  // type 0 = home, type 1 = patient, type 2 = doctor, type 3 = nurse, type 4 = staff
  if (type === 0) {
    // home
    navItems = [
      {
        
        text: "Beranda",
        linkToPage: "/",
        color: page === "Beranda" ? color : defaultColor,
      },
      {
        text: "Layanan",
        linkToPage: "/services",
        color: page === "Layanan" ? color : defaultColor,
      },
      {
        text: "Informasi",
        linkToPage: "/informations",
        color: page === "Informasi" ? color : defaultColor,
      },
      {
        text: "Artikel",
        linkToPage: "/articles",
        color: page === "Artikel" ? color : defaultColor,
      },
    ];

    buttons = [
      {
        text: "Hubungi Kami",
        href: "/contact",
        className:
          "text-white bg-[#2557D6] hover:bg-[#2557D6]/90 focus:ring-4 focus:ring-[#2557D6]/50 focus:outline-none font-medium text-sm px-4 text-center mr-3 md:mr-0",
      },
    ];
  } else if (type === 1) {
    // patient
    navItems = [
      {
        text: "Daftar Rekam Medis",
        linkToPage: `/patient/record-list`,
        color: page === "Daftar Rekam Medis" ? color : defaultColor,
      },
      {
        text: "Rawat Jalan",
        linkToPage: `/patient/appointment-list`,
        color: page === "Rawat Jalan" ? color : defaultColor,
      },
      {
        text: "Profil Pasien",
        linkToPage: `/patient/profile`,
        color: page === "Profil Pasien" ? color : defaultColor,
      },
    ];

    buttons = [
      {
        text: "Akun Pasien",
        href: `/patient/account`,
        className: `blue-button ${
          page === "patient-account"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  } else if (type === 2) {
    // doctor
    navItems = [
      {
        text: "Data Pasien",
        linkToPage: `/doctor/data-pasien`,
        color: page === "data-pasien" ? color : defaultColor,
      },
      {
        text: "Pelayanan Medis",
        linkToPage: `/doctor/pelayanan-medis`,
        color: page === "pelayanan-medis" ? color : defaultColor,
      },
      // {
      //   text: "Profil Dokter",
      //   linkToPage: `/doctor/profile`,
      //   color: page === "Profil Dokter" ? color : defaultColor,
      // },
    ];

    buttons = [
      {
        text: "Akun Dokter",
        href: `/doctor/account`,
        className: `blue-button ${
          page === "doctor-account"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  } else if (type === 3) {
    // nurse
    navItems = [
      {
        text: "Data Pasien",
        linkToPage: `/nurse/data-pasien`,
        color: page === "data-pasien" ? color : defaultColor,
      },
      {
        text: "Pelayanan Medis",
        linkToPage: `/nurse/pelayanan-medis`,
        color: page === "pelayanan-medis" ? color : defaultColor,
      },
      // {
      //   text: "Profil Perawat",
      //   linkToPage: `/nurse/profile`,
      //   color: page === "Profil Perawat" ? color : defaultColor,
      // },
    ];

    buttons = [
      {
        text: "Akun Perawat",
        href: `/nurse/account`,
        className: `blue-button ${
          page === "nurse-account"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  } else if (type === 4) {
    // staff
    navItems = [
      {
        text: "Pendaftaran",
        linkToPage: `/staff/antrean`,
        color: page === "antrean" ? color : defaultColor,
      },
      {
        text: "Data Pasien",
        linkToPage: `/staff/data-pasien`,
        color: page === "data-pasien" ? color : defaultColor,
      },
      {
        text: "Pelayanan Medis",
        linkToPage: `/staff/pelayanan-medis`,
        color: page === "pelayanan-medis" ? color : defaultColor,
      },
      // {
      //   text: "Profil Staff",
      //   linkToPage: `/staff/profile`,
      //   color: page === "Profil Staff" ? color : defaultColor,
      // },
    ];

    buttons = [
      {
        text: "Akun Staff",
        href: `/staff/account`,
        className: `blue-button ${
          page === "staff-account"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  }

  // Render Navbar component dengan prop yang telah ditentukan
  return <Navbar title={title} navItems={navItems} buttons={buttons} />;
}

export default NavbarController;
