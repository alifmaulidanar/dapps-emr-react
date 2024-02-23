import Navbar from "./Navbar";

function NavbarController({ type, page, color, accountAddress }) {
  const id = accountAddress;
  const title = "Siloam Hospitals Mampang";
  let navItems = [];
  let buttons = [];
  const defaultColor = "gray";

  // Tentukan tipe navbar berdasarkan nilai prop 'type'
  // type 0 = home, type 1 = patient, type 2 = staff, type 3 = nurse, type 4 = doctor
  if (type === 0) {
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
          "blue-button text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-4 text-center mr-3 md:mr-0",
      },
    ];
  } else if (type === 1) {
    navItems = [
      {
        text: "Daftar Rekam Medis",
        linkToPage: `/patient/record-list`,
        color: page === "Daftar Rekam Medis" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/patient/appointment`,
        color: page === "Appointment" ? color : defaultColor,
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
    navItems = [
      {
        text: "Daftar Pasien",
        linkToPage: `/patient/record-list`,
        color: page === "staff" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/patient/appointment`,
        color: page === "Appointment" ? color : defaultColor,
      },
      {
        text: "Profil Pasien",
        linkToPage: `/patient/profile`,
        color: page === "Profil Pasien" ? color : defaultColor,
      },
    ];

    buttons = [
      {
        text: "Akun Staff",
        href: `/patient/account`,
        className: `blue-button ${
          page === "staff-account"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  } else if (type === 3) {
    navItems = [
      {
        text: "Daftar Pasien",
        linkToPage: `/nurse/record-list`,
        color: page === "nurse" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/nurse/appointment`,
        color: page === "Appointment" ? color : defaultColor,
      },
      {
        text: "Profil Pasien",
        linkToPage: `/nurse/profile`,
        color: page === "Profil Pasien" ? color : defaultColor,
      },
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
    navItems = [
      {
        text: "Daftar Pasien",
        linkToPage: `/doctor/patient-list`,
        color: page === "doctor" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/doctor/appointment`,
        color: page === "Appointment" ? color : defaultColor,
      },
      {
        text: "Profil Dokter",
        linkToPage: `/doctor/profile`,
        color: page === "Profil Dokter" ? color : defaultColor,
      },
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
  }

  // Render Navbar component dengan prop yang telah ditentukan
  return <Navbar title={title} navItems={navItems} buttons={buttons} />;
}

export default NavbarController;
