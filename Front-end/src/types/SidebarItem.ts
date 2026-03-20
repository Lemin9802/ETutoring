import { StaticImageData } from "next/image";
import React from "react";

export type SidebarChild = {
  label: string;
  route: string;
};

export type SidebarItemType = {
  label: string;
  route: string;
  icon?: StaticImageData | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: SidebarChild[]; // Optional nested items
};
