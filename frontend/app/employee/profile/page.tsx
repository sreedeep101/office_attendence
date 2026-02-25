"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { formatDate } from "@/app/components/utils/formatDate";


export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showleaveMenu, setShowLeaveMenu] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [leaveReason, setLeaveReason] = useState("");
    const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

    const employeeId =
        typeof window !== "undefined"
            ? localStorage.getItem("userId")
            : null;

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;


    // Fetch Leave History
    const fetchLeaves = async () => {
        const res = await fetch(
            `http://localhost:5000/api/leave/my/${employeeId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await res.json();
        setLeaveHistory(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            const res = await fetch(
                `http://localhost:5000/api/employees/profile/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            setProfile(data.employee);
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (employeeId) fetchLeaves();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => {
            setShowMenu(false);
        };

        if (showMenu) {
            window.addEventListener("click", handleClickOutside);
        }

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, [showMenu]);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("Fill all fields");
            return;
        }

        const res = await fetch(
            `http://localhost:5000/api/employees/change-password/${profile.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }
        alert("Password changed successfully");

        setCurrentPassword("");
        setNewPassword("");
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const formData = new FormData();
        formData.append("profile_image", file);

        const res = await fetch(
            `http://localhost:5000/api/employees/profile-image/${userId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        const data = await res.json();

        if (res.ok) {
            setProfile({ ...profile, profile_image: data.image });
        } else {
            alert(data.message);
        }
    };


    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        router.push("/");
    };
    if (!profile)
        return <p className="text-center mt-10 text-lg">Loading...</p>;

    const submitLeave = async () => {
        const res = await fetch("http://localhost:5000/api/leave/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                employee_id: employeeId,
                from_date: fromDate,
                to_date: toDate,
                reason: leaveReason,
            }),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.message);

        alert("Leave requested");
        setFromDate("");
        setToDate("");
        setLeaveReason("");
        fetchLeaves();
    };

    const getStatusStyle = (status: string) => {
        if (status === "approved")
            return "bg-green-100 text-green-600";
        if (status === "rejected")
            return "bg-red-100 text-red-600";
        return "bg-yellow-100 text-yellow-600";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center pb-24">

            <div className="flex justify-between items-center w-full max-w-md mt-6">

                <h1 className="text-2xl font-bold text-black">
                    Profile
                </h1>

                <div className="relative">

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="text-black text-2xl"
                    >
                        <i className="bi bi-three-dots-vertical"></i>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-39 bg-white rounded-2xl p-[5px] shadow-lg border z-50">

                            <button
                                onClick={() => {
                                    setShowLeaveMenu(true);
                                    setShowMenu(false);
                                }}
                                className="w-full text-black text-left px-4 py-3 hover:bg-gray-100 rounded-2xl text-sm font-medium"
                            >
                                Apply Leave
                            </button>
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-2xl text-sm font-medium text-black "
                            >
                                Update Password
                            </button>

                        </div>
                    )}

                </div>

            </div>

            {/* Profile Image Section */}
            <div className="mt-10 relative">
                <img
                    src={`http://localhost:5000/uploads/${profile.profile_image}`}
                    className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                />

                <button
                    onClick={handleImageClick}
                    className="absolute bottom-2 right-2 bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                >
                    +
                </button>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />
            </div>


            {/* Name + Role */}
            <h1 className="mt-6 text-[27px] font-extrabold text-gray-800">
                {profile.name}
            </h1>
            <p className="text-gray-500 font-bold text-[20px]">{profile.position}</p>

            {/* Info Card */}
            <div className="mt-8 bg-white w-11/12 max-w-md rounded-3xl shadow-md overflow-hidden">

                <ProfileRow label="Employee ID" value={`EMP${profile.id}`} />
                <ProfileRow label="Gmail" value={profile.email} />
                <ProfileRow label="Phone" value={profile.phone} />
                <ProfileRow
                    label="Joining Date"
                    value={new Date(profile.created_at).toDateString()}
                />

            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">

                    {/* Modal Card */}
                    <div className="bg-white rounded-3xl p-6 w-11/12 max-w-md shadow-xl relative animate-fadeIn">

                        {/* Close Button */}
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 font-extrabold text-[red] text-xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-[black] text-xl font-bold mb-6">
                            Change Password
                        </h2>

                        <input
                            type="password"
                            placeholder="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full text-[#4b4646] bg-gray-100 rounded-2xl p-4 mb-4 outline-none"
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full text-[#4b4646] bg-gray-100 rounded-2xl p-4 mb-6 outline-none"
                        />

                        <button
                            onClick={async () => {
                                await handleChangePassword();
                                setShowPasswordModal(false);
                            }}
                            className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-semibold"
                        >
                            Update Password
                        </button>

                    </div>
                </div>
            )}
            {showleaveMenu && (
                <div className="fixed inset-0 gap-2 bg-black bg-opacity-40 backdrop-blur-sm flex flex-col items-center justify-center z-50">

                    {/* applay leave */}
                    <div className="bg-white rounded-3xl p-6 w-11/12 max-w-md shadow-xl relative animate-fadeIn">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowLeaveMenu(false)}
                            className="absolute top-4 right-4 font-extrabold text-[red] text-xl"
                        >
                            ✕
                        </button>
                        <h2 className="text-base text-[black] font-semibold mb-4">
                            🗓 Apply for Leave
                        </h2>

                        <div className="flex flex-col gap-3 mb-3">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full text-[grey] bg-gray-100 rounded-2xl p-4 outline-none text-sm"
                            />

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full text-[grey] bg-gray-100 rounded-2xl p-4 outline-none text-sm"
                            />

                            <input
                                type="text"
                                placeholder="Reason for leave"
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                                className="w-full text-[grey] bg-gray-100 rounded-2xl p-4 outline-none text-sm"
                            />
                        </div>

                        <button
                            onClick={submitLeave}
                            className="w-full bg-orange-500 text-white py-3 rounded-2xl font-semibold active:scale-95 transition"
                        >
                            Request Leave
                        </button>
                    </div>

                    {/* leave history modal */}
                    <div className="bg-white rounded-3xl p-6 w-11/12 max-w-md shadow-xl relative animate-fadeIn">
                        <h2 className="text-[black] text-base font-semibold mb-4">
                            📋 My Leave Status
                        </h2>

                        {leaveHistory.length === 0 ? (
                            <p className="text-gray-400 text-sm">
                                No leave requests yet.
                            </p>
                        ) : (
                            <div className="space-y-3 text-[grey]">
                                {leaveHistory.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="flex justify-between items-center bg-gray-100 rounded-2xl p-4"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {formatDate(leave.from_date)} → {formatDate(leave.to_date)}
                                            </p>
                                        </div>

                                        <span
                                            className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusStyle(
                                                leave.status
                                            )}`}
                                        >
                                            {leave.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="mt-8 bg-red-100 text-red-600 px-6 py-3 rounded-2xl w-11/12 max-w-md font-semibold shadow-sm"
            >
                Sign Out Account
            </button>
        </div>
    );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between px-6 py-4 border-b last:border-b-0">
            <span className="text-[#504e4e]">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    );
}

