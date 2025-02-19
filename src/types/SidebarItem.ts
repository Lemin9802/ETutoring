import { StaticImageData } from "next/image";

export type SidebarChild = {
  label: string;
  route: string;
};

export type SidebarItemType = {
  label: string;
  route: string;
  icon?: StaticImageData;
  children?: SidebarChild[]; // Optional nested items
};
