// src/config/menu.ts
import { IconBook, IconSettings, IconSpeakerphone } from "@tabler/icons-react"

export const navData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Digital Media Advertising",
      url: "/",
      icon: IconSpeakerphone,
      items: [
        { title: "Home", url: "/" },
        { title: "About us", url: "/about" },
      ],
    },
    {
      title: "Bookkeeping",
      url: "/bookkeeping/dashboard",
      icon: IconBook,
      items: [
        { title: "Dashboard", url: "/bookkeeping/dashboard" },
        { title: "Project", url: "/bookkeeping/project" },
        { title: "Expense", url: "/bookkeeping/expense" },
        { title: "Payables", url: "/bookkeeping/payables" },
        { title: "Accountable", url: "/bookkeeping/accountable" },
        { title: "Trash", url: "/bookkeeping/trash" },
      ],
    },
    {
      title: "Settings",
      url: "/settings/general",
      icon: IconSettings,
      items: [
        { title: "General", url: "/settings/general" },
      ],
    },
  ],
}