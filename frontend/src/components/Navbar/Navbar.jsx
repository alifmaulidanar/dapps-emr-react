// import MetaConnect from "./Buttons/MetamaskButton";

function NavItem({ text, linkToPage, color }) {
  return (
    <li>
      <a
        href={linkToPage}
        className={`block py-2 pl-3 pr-4 text-gray-900 rounded ${
          color === "blue"
            ? "text-white bg-blue-700 md:bg-transparent md:text-blue-700 md:p-0"
            : "hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700"
        } md:p-0`}
      >
        {text}
      </a>
    </li>
  );
}

function Navbar({ title, buttons, navItems }) {
  return (
    <nav className="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
      <div className="w-9/12 flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center">
          {/* <img
        src="https://flowbite.com/docs/images/logo.svg"
        className="h-8 mr-3"
        alt="Flowbite Logo"
      /> */}
          <span className="text-gray-900 self-center text-2xl font-semibold whitespace-nowrap">
            {title}
          </span>
        </a>
        <div className="flex md:order-2 gap-x-4">
          {/* INFORMASI ACCOUNT BUTTON */}
          {buttons.map((button, index) => (
            <a key={index} href={button.href}>
              <button type="button" className={button.className}>
                {button.text}
              </button>
            </a>
          ))}

          {/* METAMASK BUTTON */}
          {/* <MetaConnect /> */}

          {/* <button
            type="button"
            className="text-gray-900 bg-white hover:text-blue-700 hover:bg-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0"
          >
            Masuk
          </button> */}
          {/* <Link href="/patient/signup">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0"
            >
              Pendaftaran Pasien
            </button>
          </Link> */}

          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
            {Array.isArray(navItems) &&
              navItems.map((item, index) => (
                <NavItem
                  key={index}
                  text={item.text}
                  linkToPage={item.linkToPage}
                  color={item.color}
                />
              ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
