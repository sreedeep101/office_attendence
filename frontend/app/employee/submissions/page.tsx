"use client";
import { formatDate } from "@/app/components/utils/formatDate";
import { useEffect, useState } from "react";

export default function SubmissionPage() {
  const [reportText, setReportText] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  const employeeId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId")
      : null;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // Fetch reports
  const fetchReports = async () => {
    const res = await fetch(
      `http://localhost:5000/api/reports/my/${employeeId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setReportHistory(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (employeeId) fetchReports();
  }, []);

  const submitReport = async () => {
    if (!reportDate) {
      alert("Please select a date");
      return;
    }

    const res = await fetch("http://localhost:5000/api/reports/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        employee_id: employeeId,
        report: reportText,
        report_date: reportDate,
      }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert(data.message);
    setReportText("");
    fetchReports();
  };

  const handleEdit = (report: any) => {
    setReportText(report.report);
     const formattedDate = new Date(report.report_date)
    .toISOString()
    .split("T")[0];
    setReportDate(report.report_date);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 pb-24">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Report Submission
      </h1>

      {/* Report Form */}
      <div className="bg-white rounded-3xl shadow-md p-5 mb-6">

        <h2 className="text-base text-black font-semibold mb-4">
          📄 Daily Work Report
        </h2>

        <input
          type="date"
          value={reportDate || ""}
          onChange={(e) => setReportDate(e.target.value)}
          className="w-full text-[grey] bg-gray-100 rounded-2xl p-4 mb-4 outline-none text-sm"
        />

        <textarea
          placeholder="What did you achieve?"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          className="w-full h-28  text-[grey] bg-gray-100 rounded-2xl p-4 outline-none resize-none mb-5 text-sm"
        />

        <button
          onClick={submitReport}
          className="w-full bg-[#0c1326] text-white py-3 rounded-2xl font-semibold"
        >
          Save Report
        </button>
      </div>

      {/* Report Log */}
      <div className="bg-white rounded-3xl shadow-md p-5">

        <h2 className=" text-[#000000] text-base font-semibold mb-4">
          📋 Report History
        </h2>

        {reportHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No reports submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="bg-gray-100 rounded-2xl p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-black text-sm font-semibold">
                    {formatDate(report.report_date)}
                  </p>

                  <button
                    onClick={() => handleEdit(report)}
                    className="text-indigo-600 text-xs font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-sm text-gray-700">
                  {report.report}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}