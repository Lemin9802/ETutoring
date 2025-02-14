import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "../ClickOutside";
import useLocalStorage from "@/hook/useLocalStorage";
import BurgerIcon from "public/icons/burger-menu.svg";
import Image from "next/image";
import { menuGroupsAdmin, menuGroupsStudents } from "@/constant/menu";
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
    case "Admin":
      menuGroups = menuGroupsAdmin;
      break;
    default:
      menuGroups = menuGroupsStudents;
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute left-0 top-0 z-[9999] flex bg-gray-900 h-full w-72.5 flex-col overflow-y-hidden duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex justify-between px-6 py-5 lg:py-6 border-b border-gray-700">
          <Link href="/dashboard">
            <h1 className="text-white text-2xl font-bold text-primary text-center">
              ETutoring
            </h1>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <Image src={BurgerIcon} alt="close" width={20} height={20} />
          </button>
        </div>
        {/* SIDEBAR MENU */}
        <nav className="px-4 py-4 lg:px-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-white">
                {group.name}
              </h3>
              <ul className="mb-6 flex flex-col gap-1.5">
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
