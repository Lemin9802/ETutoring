import Link from "next/link";
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
    <header className="sticky top-0 z-[999] flex w-full bg-white border-b border-gray-100">
      <div className="flex flex-grow items-center justify-between px-4 py-3 shadow-sm md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-lg border border-gray-100 bg-white p-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <Image src={BurgerIcon} alt="close" width={20} height={20} />
            </span>
          </button>

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <h1 className="text-2xl font-bold text-primary">ETutoring</h1>
          </Link>
        </div>

        <div className="hidden sm:block">
          <form action="#" method="POST" className="relative min-w-xl mx-auto">
            <div className="relative flex items-center lg:w-[30rem] w-[20rem]">
              <button
                type="submit"
                className="absolute left-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Image src={SearchIcon} alt="Search Icon" className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Search for courses, tutors..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-gray-400"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-3">
            <DropdownNotification />
          </ul>

          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
