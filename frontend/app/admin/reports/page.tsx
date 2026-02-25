"use client";
import { useEffect, useState } from "react";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchReports = async (date: string) => {
    const res = await fetch(
      `http://localhost:5000/api/reports/admin/by-date?date=${date}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  const getPreview = (text: string) => {
    return text.split(" ").slice(0, 5).join(" ");
  };

  return (
    <div className="text-[#3f0404] px-6 py-6">
      <h1 className="text-3xl font-bold mb-6">
        Reports
      </h1>

      {/* Date Filter */}
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border rounded-2xl px-4 py-3 shadow"
        />
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-gray-400">
            No reports for this date.
          </p>
        ) : (
          reports.map((r, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-3xl shadow"
            >
              {/* Header Section */}
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`http://localhost:5000/uploads/${r.profile_image}`}
                  className="w-12 h-12 rounded-full object-cover"
                  alt="profile"
                />

                <div>
                  <h2 className="font-semibold text-gray-800">
                    {r.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {r.position}
                  </p>
                </div>
              </div>

              {/* Report Text */}
              <p className="mt-2 text-gray-700 text-sm">
                {expanded === index
                  ? r.report
                  : getPreview(r.report) + "..."}
              </p>

              <button
                className="text-purple-600 mt-2 text-sm font-medium"
                onClick={() =>
                  setExpanded(expanded === index ? null : index)
                }
              >
                {expanded === index ? "Show Less" : "Show More"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}