"use client";
import { formatDate } from "@/app/components/utils/formatDate";
import { useEffect, useState } from "react";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const fetchLeaves = async () => {
    const res = await fetch(
      "http://localhost:5000/api/leave/admin/all",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await res.json();
    setLeaves(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(
      `http://localhost:5000/api/leave/admin/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    fetchLeaves();
  };

  return (
    <div>
      <h1 className="text-[black] text-3xl font-bold mb-6">Leave Requests</h1>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full ">
          <thead className="bg-[#AD46FF]">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">From</th>
              <th className="p-4 text-left">To</th>
              <th className="p-4 text-left">Reason</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-t">
                <td className="p-4">{leave.name}</td>
                <td className="p-4">{leave.position}</td>
                <td className="p-4">{formatDate(leave.from_date)}</td>
                <td className="p-4">{formatDate(leave.to_date)}</td>
                <td className="p-4">{leave.reason}</td>
                <td className="p-4">{leave.status}</td>
                <td className="p-4 space-x-2">
                  {leave.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(leave.id, "approved")
                        }
                        className="bg-green-500 text-white px-3 py-1 rounded-xl"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(leave.id, "rejected")
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded-xl"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
