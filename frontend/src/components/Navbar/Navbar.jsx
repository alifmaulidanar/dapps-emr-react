import { Button } from "antd";
import { UserOutlined, MenuOutlined } from "@ant-design/icons";
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
    <nav className="fixed top-0 left-0 z-20 w-full bg-white border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between w-9/12 p-4 mx-auto">
        <a href="/" className="flex items-center">
          {/* <img
        src="https://flowbite.com/docs/images/logo.svg"
        className="h-8 mr-3"
        alt="Flowbite Logo"
      /> */}
          <span className="self-center text-2xl font-semibold text-gray-900 whitespace-nowrap">
            {title}
          </span>
        </a>
        <div className="flex md:order-2 gap-x-4">
          {/* INFORMASI ACCOUNT BUTTON */}
          {buttons.map((button, index) => (
            <a key={index} href={button.href}>
              <Button type="button" id={button.id} className={button.className}>
                <div className="flex gap-x-2">
                  {button.text} <UserOutlined />
                </div>
              </Button>
            </a>
          ))}

          {/* METAMASK BUTTON */}
          {/* <MetaConnect /> */}

          {/* <button
            type="button"
            className="px-4 py-2 mr-3 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:text-blue-700 hover:bg-white focus:ring-4 focus:outline-none focus:ring-blue-300 md:mr-0"
          >
            Masuk
          </button> */}
          {/* <Link href="/patient/signup">
            <button
              type="button"
              className="px-4 py-2 mr-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 md:mr-0"
            >
              Pendaftaran Pasien
            </button>
          </Link> */}

          <Button
            type="text"
            icon={<MenuOutlined />}
            className="inline-flex items-center justify-center h-10 p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
          </Button>
        </div>
        <div
          className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg md:p-0 bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white">
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
