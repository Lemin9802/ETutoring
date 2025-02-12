import DashboardIcon from "public/icons/menu/dashboard.svg";
import CalendarIcon from "public/icons/menu/calendar.svg";
import ProfileIcon from "public/icons/menu/profile.svg";
import FormsIcon from "public/icons/menu/form.svg";
import TablesIcon from "public/icons/menu/table.svg";
import SettingsIcon from "public/icons/menu/setting.svg";
import ChartIcon from "public/icons/menu/chart.svg";
import UIElementsIcon from "public/icons/menu/ui-element.svg";
import AuthenticationIcon from "public/icons/menu/authentication.svg";

export const menuGroupsStudents = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: DashboardIcon,
        label: "Dashboard",
        route: "/dashboard",
      },
      {
        icon: CalendarIcon,
        label: "Calendar",
        route: "/calendar",
      },
      {
        icon: ProfileIcon,
        label: "Profile",
        route: "/profile",
      },
      {
        icon: FormsIcon,
        label: "Forms",
        route: "#",
        children: [
          { label: "Form Elements", route: "/forms/form-elements" },
          { label: "Form Layout", route: "/forms/form-layout" },
        ],
      },
      {
        icon: TablesIcon,
        label: "Tables",
        route: "/tables",
      },
      {
        icon: SettingsIcon,
        label: "Settings",
        route: "/settings",
      },
    ],
  },
  {
    name: "OTHERS",
    menuItems: [
      {
        icon: ChartIcon,
        label: "Chart",
        route: "/chart",
      },
      {
        icon: UIElementsIcon,
        label: "UI Elements",
        route: "#",
        children: [
          { label: "Alerts", route: "/ui/alerts" },
          { label: "Buttons", route: "/ui/buttons" },
        ],
      },
      {
        icon: AuthenticationIcon,
        label: "Authentication",
        route: "#",
        children: [
          { label: "Sign In", route: "/auth/signin" },
          { label: "Sign Up", route: "/auth/signup" },
        ],
      },
    ],
  },
];

export const menuGroupsAdmin = [
  {
    name: "ADMIN MENU",
    menuItems: [
      {
        icon: DashboardIcon,
        label: "Dashboard",
        route: "/admin/dashboard",
      },
      {
        icon: CalendarIcon,
        label: "Calendar",
        route: "/admin/calendar",
      },
      {
        icon: ProfileIcon,
        label: "Users",
        route: "/admin/users",
      },
      {
        icon: FormsIcon,
        label: "Forms",
        route: "#",
        children: [
          { label: "Form Elements", route: "/forms/form-elements" },
          { label: "Form Layout", route: "/forms/form-layout" },
        ],
      },
      {
        icon: TablesIcon,
        label: "Tables",
        route: "/admin/tables",
      },
      {
        icon: SettingsIcon,
        label: "Settings",
        route: "/settings",
      },
    ],
  },
];

export const menuGroupsModerators = [
  {
    name: "Moderators Menu",
    menuItems: [
      {
        icon: DashboardIcon,
        label: "Dashboard",
        route: "/moderators",
      },
      {
        icon: CalendarIcon,
        label: "Manage Students",
        route: "/moderators/manage/students",
      },
      {
        icon: CalendarIcon,
        label: "Manage Tutors",
        route: "/moderators/manage/tutor",
      },
      {
        icon: CalendarIcon,
        label: "Manage Appointments",
        route: "/moderators/manage/appointments",
      },
    ],
  },
];
