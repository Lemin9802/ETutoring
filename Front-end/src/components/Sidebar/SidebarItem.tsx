import Link from "next/link";
import SidebarDropdown from "@/components/Sidebar/SidebarDropdown";
import { usePathname } from "next/navigation";
import { SidebarItemType } from "@/types/SidebarItem";
import Image from "next/image";
import React from "react";
import { ComponentType } from "react";

interface IconProps {
  size?: number;
}

type SidebarItemProps = {
  item: SidebarItemType;
  pageName: string;
  setPageName: (name: string) => void;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  pageName,
  setPageName,
}) => {
  const handleClick = () => {
    const updatedPageName =
      pageName !== item.label.toLowerCase() ? item.label.toLowerCase() : "";
    return setPageName(updatedPageName);
  };

  const pathname = usePathname();

  const isActive = (item: SidebarItemType): boolean => {
    if (item.route === pathname) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child));
    }
    return false;
  };

  const isItemActive = isActive(item);

  return (
    <>
      <li>
        <Link
          href={item.route}
          onClick={handleClick}
          className={`group relative flex items-center gap-3 rounded-md px-4 py-2.5 font-medium transition-all duration-200 ease-in-out ${
            isItemActive
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800/70 hover:text-white"
          }`}
        >
          {item.icon &&
            (typeof item.icon === "string" ? (
              <div className="flex items-center justify-center h-5 w-5 transition-all duration-200">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                />
              </div>
            ) : (
              <span
                className={`text-${
                  isItemActive ? "white" : "gray-400"
                } group-hover:text-white transition-colors duration-200`}
              >
                {typeof item.icon !== "string" && "src" in item.icon
                  ? null
                  : React.createElement(item.icon as ComponentType<IconProps>, {
                      size: 20,
                    })}
              </span>
            ))}
          <span className="transition-all duration-200">{item.label}</span>
          {item.children && (
            <svg
              className={`absolute right-3 top-1/2 -translate-y-1/2 fill-current text-gray-400 transition-transform duration-200 ${
                pageName === item.label.toLowerCase()
                  ? "rotate-180 text-white"
                  : "group-hover:text-white"
              }`}
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                fill=""
              />
            </svg>
          )}
        </Link>

        {item.children && (
          <div
            className={`overflow-hidden transition-all duration-300 ${
              pageName === item.label.toLowerCase()
                ? "max-h-screen opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <SidebarDropdown item={item.children} />
          </div>
        )}
      </li>
    </>
  );
};

export default SidebarItem;
