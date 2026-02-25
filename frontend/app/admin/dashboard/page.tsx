"use client";
import { formatDate } from "@/app/components/utils/formatDate";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";
import { ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, trendRes, hoursRes, leaveRes] = await Promise.all([
          fetch("http://localhost:5000/api/employees/stats", {
            headers: { Authorization: `Bearer ${token}` }
          }),

          fetch(`http://localhost:5000/api/attendance/admin/monthly-trend?offset=${monthOffset}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),

          fetch(`http://localhost:5000/api/attendance/admin/monthly-hours?offset=${monthOffset}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),

          fetch("http://localhost:5000/api/leave/admin/stats", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const statsData = await statsRes.json();
        const trendData = await trendRes.json();
        const hoursData = await hoursRes.json();
        const leaveData = await leaveRes.json();

        setStats(statsData);
        setTrend(
          Array.isArray(trendData)
            ? trendData.map((item: any) => ({
              ...item,
              date: formatDate(item.date),
            }))
            : []
        );
        setHours(Array.isArray(hoursData) ? hoursData : []);
        setLeaveStats(Array.isArray(leaveData) ? leaveData : []);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthOffset]);



  const COLORS = ["#22c55e", "#ef4444", "#facc15"];

  if (loading) {
    return <p className="text-2xl font-bold text-[#295c30]">Loading Dashboard...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#3f0404]">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-md">
          <h2 className="text-[13px] font-semibold text-gray-400">
            Total Employees
          </h2>
          <p className="text-3xl mt-2 text-[black]">{stats?.totalEmployees || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <h2 className="text-[13px] font-semibold text-gray-400">
            Present Today
          </h2>
          <p className="text-3xl mt-2 text-green-600">
            {stats?.presentToday || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <h2 className="text-[13px] font-semibold text-gray-400">
            Absent Today
          </h2>
          <p className="text-3xl mt-2 text-red-600">
            {stats?.absentToday || 0}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="mr-3 font-semibold text-[#000000]">Select Month:</label>

        <select
          value={monthOffset}
          onChange={(e) => setMonthOffset(Number(e.target.value))}
          className="border p-2 text-[green] rounded-xl"
        >
          <option value={0}>Current Month</option>
          <option value={1}>Last Month</option>
          <option value={2}>2 Months Ago</option>
          <option value={3}>3 Months Ago</option>
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Monthly Attendance Trend */}
        <div className="bg-white p-6 rounded-3xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-6 text-[#000000]">
            Monthly Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
              />
              <Line
                type="monotone"
                dataKey="present_count"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Work Hours */}
        <div className="bg-white p-6 rounded-3xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-6 text-[#000000]">
            Monthly Work Hours
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={hours}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
              />
              <Bar
                dataKey="hours"
                fill="#2563eb"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leave Statistics */}
      <div className="bg-white p-6 rounded-3xl shadow">
        <h2 className="text-xl font-semibold mb-6 text-[#000000]">
          Leave Statistics
        </h2>

        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveStats}
                dataKey="count"
                nameKey="status"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
              >
                {leaveStats.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.status === "approved"
                        ? "#22c55e"
                        : entry.status === "rejected"
                          ? "#ef4444"
                          : "#facc15"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
