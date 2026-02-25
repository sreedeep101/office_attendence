"use client";
import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from "recharts";


export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [workHours, setWorkHours] = useState("0.00");
  const [logs, setLogs] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);


  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const totalLeaves = leaveStats.reduce((sum, item) => sum + item.count, 0);

const approvedLeaves =
  leaveStats.find(item => item.status === "approved")?.count || 0;

const leavePercent =
  totalLeaves === 0
    ? 0
    : Math.round((approvedLeaves / totalLeaves) * 100);


  useEffect(() => {
    if (!userId) return;

    // Fetch leave stats
    fetch(`http://localhost:5000/api/leave/employee/stats/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLeaveStats(Array.isArray(data) ? data : []));

    // Fetch attendance monthly data
    fetch(`http://localhost:5000/api/attendance/employee/monthly/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAttendanceData(Array.isArray(data) ? data : []));

    // Fetch profile
    fetch(`http://localhost:5000/api/employees/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data.employee));

    // Fetch today hours
    fetch(`http://localhost:5000/api/attendance/today/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setWorkHours(data.totalWorkHours || "0.00"));

    // Fetch recent logs
    fetch(`http://localhost:5000/api/attendance/logs/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLogs(Array.isArray(data) ? data : []));
  }, []);

  if (!profile) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 px-4 pt-8 pb-24">

      {/* Greeting Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hi, {profile.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500">
            It's a beautiful day for work!
          </p>
        </div>

        <img
          src={`http://localhost:5000/uploads/${profile.profile_image}`}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Dark Work Hours Card */}
      <div className="bg-[#1f2a3d] text-white rounded-3xl p-6 mb-8 shadow-lg">

        <div className="flex justify-between items-center mb-6">
          <div className="bg-white bg-opacity-10 p-3 rounded-xl">
            ⏰
          </div>

          <div className="text-right">
            <p className="text-xs opacity-70">SHIFT HOURS</p>
            <p className="font-semibold text-sm">
              09:00 AM - 06:00 PM
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-bold">
          {workHours}
        </h2>
        <p className="text-sm opacity-70">
          Logged work hours today
        </p>
      </div>

      <h2 className="text-[black] text-lg font-semibold mb-4">
        Work Analytics
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-8">

        {/* Leave Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center">

  <div className="relative w-28 h-28">

    <svg className="w-full h-full rotate-[-90deg]">
      <circle
        cx="56"
        cy="56"
        r="50"
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="56"
        cy="56"
        r="50"
        stroke="#6366f1"
        strokeWidth="8"
        fill="none"
        strokeDasharray={2 * Math.PI * 50}
        strokeDashoffset={
          2 * Math.PI * 50 * (1 - leavePercent / 100)
        }
        strokeLinecap="round"
      />
    </svg>

    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
      {leavePercent}%
    </div>
  </div>

  <p className="text-black mt-4 text-sm font-semibold">
    Leave Approval
  </p>
  <p className="text-xs text-gray-400">
    Overall Status
  </p>

</div>

        {/* Attendance Bar Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center">

  <div className="flex items-end gap-2 h-28">

    {attendanceData.slice(-5).map((day, index) => (
      <div
        key={index}
        className="w-4 rounded-md bg-indigo-500"
        style={{
          height: `${Math.min(day.hours * 10, 100)}%`,
          opacity: 0.6 + index * 0.1
        }}
      />
    ))}

  </div>

  <p className="text-black mt-4 text-sm font-semibold">
    Attendance
  </p>
  <p className="text-xs text-gray-400">
    Recent Days
  </p>

</div>

      </div>


      {/* Recent Logs */}
      <div className="bg-white rounded-3xl p-6 shadow-md">
        <h2 className="text-[#000000] text-lg font-semibold mb-4">
          Recent Logs
        </h2>

        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">
            No logs today.
          </p>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-[black] font-bold">
                      {log.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.note || "Office"}
                    </p>
                  </div>
                </div>

                <p className="text-[black] text-sm font-semibold">
                  {log.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
