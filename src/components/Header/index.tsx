import Link from "next/link";
import DropdownMessage from "./DropdownMessage";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import SearchIcon from "public/icons/search.svg";
import BurgerIcon from "public/icons/burger-menu.svg";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <Image src={BurgerIcon} alt="close" width={20} height={20} />
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            {/* <Image
              width={32}
              height={32}
              src={"/images/logo/logo-icon.svg"}
              alt="Logo"
            /> */}
            {/* title ETutoring */}
            <h1 className="text-2xl font-bold text-primary">ETutoring</h1>
          </Link>
        </div>

        <div className="hidden sm:block">
          <form action="#" method="POST" className="relative min-w-xl mx-auto">
            <div className="relative flex items-center lg:w-[30rem] w-[20rem]">
              <button
                type="submit"
                className="absolute left-3 text-gray-500 hover:text-gray-700 transition"
              >
                <Image src={SearchIcon} alt="Search Icon" className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full rounded-full border border-gray-300 bg-gray-100 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition outline-none"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Notification Menu Area --> */}
            <DropdownNotification />
            {/* <!-- Notification Menu Area --> */}

            {/* <!-- Chat Notification Area --> */}
            <DropdownMessage />
            {/* <!-- Chat Notification Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <DropdownUser />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
