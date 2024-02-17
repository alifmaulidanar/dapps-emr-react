import Navbar from "./Navbar";

function NavbarController({ type, page, color, accountAddress }) {
  const id = accountAddress;
  const title = "Siloam Hospitals Mampang";
  let navItems = [];
  let buttons = [];
  const defaultColor = "gray";

  // Tentukan tipe navbar berdasarkan nilai prop 'type'
  if (type === 1) {
    navItems = [
      { text: "Beranda", color: page === "Beranda" ? color : defaultColor },
      { text: "Layanan", color: page === "Layanan" ? color : defaultColor },
      { text: "Informasi", color: page === "Informasi" ? color : defaultColor },
      { text: "Artikel", color: page === "Artikel" ? color : defaultColor },
    ];

    buttons = [
      {
        text: "Hubungi Kami",
        href: "/contact",
        className:
          "blue-button text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-4 text-center mr-3 md:mr-0",
      },
    ];
  } else if (type === 2) {
    navItems = [
      {
        text: "Daftar Rekam Medis",
        linkToPage: `/patient/${id}/record-list`,
        color: page === "Daftar Rekam Medis" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/patient/${id}/appointment`,
        color: page === "Appointment" ? color : defaultColor,
      },
      {
        text: "Profil Pasien",
        linkToPage: `/patient/${id}/profile`,
        color: page === "Profil Pasien" ? color : defaultColor,
      },
    ];

    buttons = [
      {
        text: "Informasi Akun",
        href: `/patient/${id}/account`,
        className: `blue-button ${
          page === "Akun Pasien"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 text-center mr-3 md:mr-0`,
      },
    ];
  } else if (type === 3) {
    navItems = [
      {
        text: "Daftar Pasien",
        linkToPage: `/doctor/${id}/patient-list`,
        color: page === "Daftar Pasien" ? color : defaultColor,
      },
      {
        text: "Appointment",
        linkToPage: `/doctor/${id}/appointment`,
        color: page === "Appointment" ? color : defaultColor,
      },
      {
        text: "Profil Dokter",
        linkToPage: `/doctor/${id}/profile`,
        color: page === "Profil Dokter" ? color : defaultColor,
      },
    ];

    buttons = [
      {
        text: "Informasi Akun",
        href: `/doctor/${id}/account`,
        className: `${
          page === "Akun Dokter"
            ? `text-white bg-${color}-600`
            : `text-${color}-700 bg-transparent hover:bg-${color}-700`
        } border border-1 border-${color}-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-${color}-300 font-medium text-sm px-4 py-2 text-center mr-3 md:mr-0`,
      },
    ];
  }

  // Render Navbar component dengan prop yang telah ditentukan
  return <Navbar title={title} navItems={navItems} buttons={buttons} />;
}

export default NavbarController;
