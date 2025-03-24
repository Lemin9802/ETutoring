import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarChild } from "@/types/SidebarItem";

type SidebarDropdownProps = {
  item: SidebarChild[]; // An array of child items
};

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({ item }) => {
  const pathname = usePathname();

  return (
    <>
      <ul className="mt-2 flex flex-col gap-1 pl-6">
        {item.map((item, index: number) => (
          <li key={index}>
            <Link
              href={item.route}
              className={`group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium transition-all duration-200 ease-in-out ${
                pathname === item.route
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="before:absolute before:left-0 before:top-1/2 before:h-px before:w-2.5 before:-translate-y-1/2 before:bg-gray-500"></span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SidebarDropdown;
