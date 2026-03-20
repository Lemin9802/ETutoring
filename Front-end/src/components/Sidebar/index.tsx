import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "../ClickOutside";
import useLocalStorage from "@/hook/useLocalStorage";
import BurgerIcon from "public/icons/burger-menu.svg";
import Image from "next/image";
import {
  menuGroupsAdmin,
  menuGroupsModerators,
  menuGroupsStudents,
  menuGroupsTeachers,
} from "@/constant/menu";
import { useSession } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const { data: session } = useSession();

  let menuGroups;

  switch (session?.user?.roles) {
    case "Tutor":
      menuGroups = menuGroupsTeachers;
      break;
    case "Moderator":
      menuGroups = menuGroupsModerators;
      break;
    case "Admin":
      menuGroups = menuGroupsAdmin;
      break;
    default:
      menuGroups = menuGroupsStudents;
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute left-0 top-0 z-[9999] flex h-full w-72.5 flex-col overflow-y-hidden bg-gray-900 shadow-lg transition-all duration-300 ease-in-out dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-5 lg:py-6">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white hover:text-primary transition-colors duration-200">
              ETutoring
            </h1>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block rounded-md p-1.5 text-white hover:bg-gray-800 transition-colors duration-200 lg:hidden"
          >
            <Image src={BurgerIcon} alt="close" width={20} height={20} />
          </button>
        </div>
        {/* SIDEBAR MENU */}
        <nav className="custom-scrollbar h-full overflow-y-auto px-4 py-6 lg:px-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <h3 className="mb-4 ml-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {group.name}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.menuItems.map((menuItem, menuIndex) => (
                  <SidebarItem
                    key={menuIndex}
                    item={menuItem}
                    pageName={pageName}
                    setPageName={setPageName}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
