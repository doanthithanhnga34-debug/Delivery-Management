
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  LayoutDashboard,
  ClipboardList,
  UsersRound,
  SlidersHorizontal,
  FileText,
  History,
  Truck,
} from "lucide-react"

import styles from "./Sidebar.module.css"

type Role = "admin" | "shipper"

const adminItems = [
  {
    label: "Thiết lập phí ship",
    href: "/admin/rates",
    icon: SlidersHorizontal,
  },
]

const shipperItems = [
  {
    label: "Tạo phiếu",
    href: "/shipper/create",
    icon: FileText,
  },
  {
    label: "Lịch sử phiếu",
    href: "/shipper/history",
    icon: History,
  },
]

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const items = role === "admin" ? adminItems : shipperItems

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Truck size={24} />
        <span>TeokbokkiShip</span>
      </div>

      <nav className={styles.navigation}>
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" &&
              pathname.startsWith(`${href}/`))

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${
                active ? styles.active : ""
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}