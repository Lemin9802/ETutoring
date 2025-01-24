export type SidebarChild = {
  label: string;
  route: string;
};

export type SidebarItemType = {
  label: string;
  route: string;
  icon?: React.ReactNode; // Optional icon
  children?: SidebarChild[]; // Optional nested items
};
