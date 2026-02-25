"use client";
import Link from "next/link";
import { useRouter , usePathname } from "next/navigation";
import { useEffect } from "react";
import MobileFooter from "./components/MobileFooter";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
  const role = localStorage.getItem("role");
  if (role !== "employee") {
    router.push("/");
  }
}, []);

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] p-[7px] ">
      {/* Main Content */}
      <div className="flex-1 p-1 overflow-auto">
        {children}
      </div>

      {/* footer */}
      <MobileFooter />
      
    </div>
  );
}
