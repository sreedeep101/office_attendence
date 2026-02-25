"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardCheck, FileText, User } from "lucide-react";

export default function MobileFooter() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, path: "/employee/dashboard" },
    { icon: ClipboardCheck, path: "/employee/attendance" },
    { icon: FileText, path: "/employee/submissions" },
    { icon: User, path: "/employee/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t z-50">
      <div className="flex justify-around items-center py-4">

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <div
              key={index}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center cursor-pointer"
            >
              <Icon
                size={24}
                className={`transition ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400"
                }`}
              />

              {/* Active Dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1"></div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}