"use client";
import Link from "next/link";
import { useRouter , usePathname } from "next/navigation";
import { useEffect } from "react";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    router.push("/");
  }
}, []);


  const handleLogout = () => {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      router.push("/");
    }
  };

   const linkStyle = (path: string) =>
    `p-3 rounded-xl font-bold text-[black] transition-all duration-300 ease-in-out ${
      pathname === path
        ? "bg-purple-500 text-white"
        : "hover:bg-[#1c8fec] hover:text-white"
    }`;

  return (
    <div className="flex h-screen bg-[#f1f0f8] p-[10px]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col justify-between rounded-[20px]">
        <div>
          <h2 className="text-2xl font-extrabold p-6 text-[black]">Admin Panel</h2>

          <nav className="flex flex-col gap-2 px-4">
            <Link href="/admin/dashboard" className={linkStyle("/admin/dashboard")}>
              Dashboard
            </Link>
            <Link href="/admin/employees" className={linkStyle("/admin/employees")}>
              Employees
            </Link>
            <Link href="/admin/attendance" className={linkStyle("/admin/attendance")}>
              Attendance
            </Link>
            <Link href="/admin/reports" className={linkStyle("/admin/reports")}>
              Reports
            </Link>
            <Link href="/admin/leave" className={linkStyle("/admin/leave")}>
              Leave Requests
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full font-bold bg-purple-500 text-white py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
