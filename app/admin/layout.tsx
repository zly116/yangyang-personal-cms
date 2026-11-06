import { redirect } from "next/navigation";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (process.env.CONTENT_SOURCE === "nocobase") {
    const adminUrl = process.env.NOCOBASE_PUBLIC_ADMIN_URL?.trim();
    redirect(adminUrl || "https://cms.geyangyang.vip/admin");
  }

  return children;
}
