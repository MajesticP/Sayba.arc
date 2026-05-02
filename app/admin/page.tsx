import type { Metadata } from "next"
import AdminDashboard from "./admin-dashboard"

export const metadata: Metadata = {
  title: "Admin — SAYBA ARC",
  description: "Dashboard admin untuk mengelola portofolio dan layanan.",
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminDashboard />
}
