"use client";
import { useEffect, useState } from "react";
import { formatDuration } from "@/app/components/utils/formatDuration";

export default function AdminAttendance() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
                "http://localhost:5000/api/attendance/admin/today",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const result = await res.json();

            if (Array.isArray(result)) {
                setData(result);
            } else {
                console.error("Unexpected API response:", result);
                setData([]);
            }
        };

        fetchData();
    }, []);


    return (
        <div>
            <h1 className="text-[#3f0404] text-3xl font-bold mb-6">Today's Attendance</h1>

            <div className="bg-white rounded-3xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-[#a840fd]">
                        <tr>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Work Hours</th>
                            <th className="p-4 text-left">Break Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(data) && data.map(emp => (
                            <tr key={emp.id} className="border-t">
                                <td className="text-[#000000] p-4">{emp.name}</td>
                                <td className="text-[#000000] p-4">
                                    {emp.present ? (
                                        <span className="text-green-600">Present</span>
                                    ) : (
                                        <span className="text-red-600">Absent</span>
                                    )}
                                </td>
                                <td className="text-[#000000] p-4">
                                    {formatDuration(emp.total_work_minutes || 0)}
                                </td>
                                <td className="text-[#000000] p-4">
                                    {formatDuration(emp.break_minutes || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
