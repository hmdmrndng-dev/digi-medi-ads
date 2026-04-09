// src/config/menu.ts
import { Settings2, SquareTerminal } from "lucide-react"
import { IconBook } from "@tabler/icons-react"

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
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Home", url: "/" },
        { title: "About us", url: "/about" },
      ],
    },
    {
      title: "Bookkeeping",
      url: "/bookkeeping",
      icon: IconBook,
      items: [
        { title: "Dashboard", url: "/bookkeeping/dashboard" },
        { title: "Financial", url: "/bookkeeping/financial" },
        { title: "Expense", url: "/bookkeeping/expense" },
        { title: "Payables", url: "/bookkeeping/payables" },
        { title: "Accountable", url: "/bookkeeping/accountable" },
        { title: "Trash", url: "/bookkeeping/trash" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/settings/general" },
      ],
    },
  ],
}