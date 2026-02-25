"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AttendancePage() {
  const router = useRouter();

  const [working, setWorking] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Checking location...");
  const [verified, setVerified] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // ✅ Safely load localStorage after mount
  useEffect(() => {
    setEmployeeId(localStorage.getItem("userId"));
    setToken(localStorage.getItem("token"));
  }, []);

  // ✅ Fetch working status
  useEffect(() => {
    if (!employeeId || !token) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/attendance/status/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setWorking(data.working);
      } catch (err) {
        console.error("Status fetch failed");
      }
    };

    fetchStatus();
  }, [employeeId, token]);

  // ✅ Auto logout after 7 PM
  useEffect(() => {
    const checkOfficeTime = () => {
      const hour = new Date().getHours();

      if (hour >= 19 || hour < 8) {
        alert("Office hours ended. Logging out.");
        localStorage.clear();
        router.replace("/");
      }
    };

    checkOfficeTime();
    const interval = setInterval(checkOfficeTime, 60000);

    return () => clearInterval(interval);
  }, [router]);

  // ✅ Auto checkout if outside radius
  useEffect(() => {
    if (!working || !employeeId || !token) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await fetch(
            "http://localhost:5000/api/attendance/validate-location",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                employee_id: employeeId,
                lat: latitude,
                lng: longitude,
              }),
            }
          );

          if (!res.ok) {
            // 🔴 Call actual checkout API
            await fetch(
              "http://localhost:5000/api/attendance/checkout",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  employee_id: employeeId,
                  lat: latitude,
                  lng: longitude,
                }),
              }
            );

            alert("You moved outside office. Auto checkout.");
            setWorking(false);
          }
        } catch (err) {
          console.error("Location validation failed");
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [working, employeeId, token]);

  useEffect(() => {
    if (!employeeId || !token) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/attendance/history/${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("History fetch failed");
      }
    };

    fetchHistory();
  }, [employeeId, token]);

  // ✅ Manual Check In / Out
  const handleAttendance = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        const endpoint = working ? "checkout" : "checkin";

        const res = await fetch(
          `http://localhost:5000/api/attendance/${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              employee_id: employeeId,
              lat: latitude,
              lng: longitude,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setLocationStatus(data.message);
          setVerified(false);
          return;
        }

        setWorking(!working);
        setLocationStatus("Location Verified: Office A");
        setVerified(true);
      } catch (err) {
        console.error("Attendance action failed");
      }
    });
  };

  const formatDuration = (minutes: number) => {
    const total = Math.floor(minutes || 0);
    const hrs = Math.floor(total / 60);
    const mins = total % 60;

    if (hrs === 0 && mins === 0) return "0h";
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900">
        Mark Attendance
      </h1>

      <p className="text-gray-500 text-sm mt-2 text-center">
        Make sure you are within the office radius (400m)
      </p>

      <div className="mt-16 relative">
        <button
          onClick={handleAttendance}
          className={`w-72 h-72 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition active:scale-95
          ${working
              ? "bg-gradient-to-br from-red-500 to-red-700"
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
            }`}
        >
          <div className="bg-white bg-opacity-20 p-6 rounded-full mb-4">
            ⏰
          </div>

          <h2 className="text-2xl font-bold">
            {working ? "Check Out" : "Check In"}
          </h2>

          <p className="text-xs mt-1 opacity-80">
            TAP
          </p>
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${verified ? "bg-green-500" : "bg-gray-400"
            }`}
        ></span>

        <p className="text-gray-700 text-sm">
          {locationStatus}
        </p>
      </div>
      {/* Attendance History */}
      <div className="w-full mt-12 max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Attendance History
        </h2>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">
            No attendance records yet.
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((day, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-4 shadow-md"
              >
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {new Date(day.date).toLocaleDateString()}
                </p>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Work Time
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatDuration(day.total_work_minutes)}
                  </span>
                </div>

                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">
                    Break Time
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {formatDuration(day.total_break_minutes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}