import {
  Home,
  Calendar,
  User,
  FileText,
  Table,
  Settings,
  BarChart,
  Layers,
  Lock,
  MessageSquare,
  FileEdit,
  File,
} from "lucide-react";

export const menuGroupsStudents = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: Home,
        label: "Dashboard",
        route: "/students",
      },
      {
        icon: MessageSquare,
        label: "Chatting",
        route: "/messages",
      },
      {
        icon: Calendar,
        label: "Calendar",
        route: "/students/calendar",
      },
      {
        icon: File,
        label: "Documents",
        route: "/documents/document-list",
      },
      {
        icon: User,
        label: "Profile",
        route: "/profile",
      },
      {
        icon: User,
        label: "My tutors",
        route: "/students/tutors",
      },
      {
        icon: FileText,
        label: "Forms",
        route: "#",
        children: [
          { label: "Form Elements", route: "/forms/form-elements" },
          { label: "Form Layout", route: "/forms/form-layout" },
        ],
      },
      {
        icon: Table,
        label: "Tables",
        route: "/tables",
      },
      {
        icon: FileEdit,
        label: "Blogs",
        route: "/blogs",
      },
      {
        icon: Calendar,
        label: "Meeting Calendar",
        route: "/meeting",
      },
      {
        icon: Settings,
        label: "Settings",
        route: "/settings",
      },
    ],
  },
  {
    name: "OTHERS",
    menuItems: [
      {
        icon: BarChart,
        label: "Chart",
        route: "/chart",
      },
      {
        icon: Layers,
        label: "UI Elements",
        route: "#",
        children: [
          { label: "Alerts", route: "/ui/alerts" },
          { label: "Buttons", route: "/ui/buttons" },
        ],
      },
      {
        icon: Lock,
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
        icon: Home,
        label: "Dashboard",
        route: "/admin",
      },
      {
        icon: Calendar,
        label: "Calendar",
        route: "/admin/calendar",
      },
      {
        icon: User,
        label: "Users",
        route: "/admin/users",
      },
      // {
      //   icon: FileText,
      //   label: "Forms",
      //   route: "#",
      //   children: [
      //     { label: "Form Elements", route: "/forms/form-elements" },
      //     { label: "Form Layout", route: "/forms/form-layout" },
      //   ],
      // },
      {
        icon: FileEdit,
        label: "Blogs",
        route: "/blogs",
      },
      {
        icon: Table,
        label: "Tables",
        route: "/admin/tables",
      },
      {
        icon: Settings,
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
        icon: Home,
        label: "Dashboard",
        route: "/moderators",
      },
      {
        icon: Calendar,
        label: "Calendar",
        route: "/moderators/calendar",
      },
      {
        icon: User,
        label: "Manage Students",
        route: "/moderators/manage/users/students",
      },
      {
        icon: User,
        label: "Manage Tutors",
        route: "/moderators/manage/users/tutor",
      },
      {
        icon: User,
        label: "Manage Users",
        route: "/moderators/manage/users",
      },
      {
        icon: Calendar,
        label: "Manage allocations",
        route: "/moderators/manage/allocations",
      },
      {
        icon: Calendar,
        label: "Manage Appointments",
        route: "/moderators/manage/appointments",
      },
      {
        icon: Layers,
        label: "Manage Relationships",
        route: "/moderators/manage/relationships",
      },
      {
        icon: BarChart,
        label: "Statistics",
        route: "/moderators/manage/statistics",
      },
      {
        icon: MessageSquare,
        label: "Chat Management",
        route: "/moderators/manage/chat",
      },
    ],
  },
];

export const menuGroupsTeachers = [
  {
    name: "TEACHER MENU",
    menuItems: [
      {
        icon: Home,
        label: "Dashboard",
        route: "/tutors",
      },
      {
        icon: Calendar,
        label: "Calendar",
        route: "/calendar",
      },
      {
        icon: MessageSquare,
        label: "Chatting",
        route: "/messages",
      },
      {
        icon: User,
        label: "My Students",
        route: "/tutors/students",
      },
      {
        icon: File,
        label: "Documents",
        route: "/documents/document-list",
      },
      {
        icon: BarChart,
        label: "Performance",
        route: "/tutors/performance",
      },
      {
        icon: FileEdit,
        label: "Resources",
        route: "/tutors/resources",
      },
      {
        icon: User,
        label: "Profile",
        route: "/profile",
      },
      {
        icon: Settings,
        label: "Settings",
        route: "/tutors/settings",
      },
    ],
  },
];
