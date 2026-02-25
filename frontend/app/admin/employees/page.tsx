"use client";
import { useEffect, useState } from "react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  console.log("profile data:", profileData);

  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    position: "",
    profile_image: null,
  });

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:5000/api/employees", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      ;
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("position", form.position);

    if (form.profile_image) {
      formData.append("profile_image", form.profile_image);
    }

    if (editMode) {
      await fetch(
        `http://localhost:5000/api/employees/edit/${selectedEmployee.id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
    } else {
      await fetch("http://localhost:5000/api/employees/add", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }

      });
    }

    setIsOpen(false);
    await fetchEmployees();
  };


  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  const closeDrawer = () => {
    setIsOpen(false);
    setEditMode(false);
    setSelectedEmployee(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      position: "",
      profile_image: null,
    });
  };


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#460505]">Employee Management</h1>

      {/* Top Bar */}
      <div className="flex justify-between mb-6 ">
        <div className="bg-[white] p-1 rounded-[15px]">
          <i className="bi bi-search text-[black] font-extrabold ml-3"></i>
          <input
            placeholder="Search employee..."
            className="bg-[#ffffff] focus:outline-none text-[#817a7a] border-none p-2 rounded-[23px] w-64 placeholder-[#555353]"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>



        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-2xl shadow"
        >
          + Add Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#9810fac0]">
            <tr>
              <th className="p-4 text-left">Profile Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Position</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="p-4">
                  {emp.profile_image && (
                    <img
                      src={`http://localhost:5000/uploads/${emp.profile_image}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                </td>
                <td className="p-4 text-[black]">{emp.name}</td>
                <td className="p-4 text-[black]">{emp.email}</td>
                <td className="p-4 text-[black]">{emp.phone}</td>
                <td className="p-4 text-[black]">{emp.position}</td>
                <td className="p-4">
                  <button
                    className="text-blue-600 m-2 font-bold bg-[#deecf7] px-3 py-1 rounded-xl"
                    onClick={async () => {
                      const res = await fetch(
                        `http://localhost:5000/api/employees/profile/${emp.id}`, {
                        headers: {
                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                      }
                      );
                      const data = await res.json();
                      setProfileData(data);
                      setProfileOpen(true);
                    }}
                  >
                    View
                  </button>

                  <button
                    className="text-purple-600 m-2 font-bold bg-[#deecf7] px-3 py-1 rounded-xl"
                    onClick={() => {
                      setEditMode(true);
                      setSelectedEmployee(emp);
                      setForm({
                        name: emp.name,
                        email: emp.email,
                        phone: emp.phone,
                        position: emp.position,
                        profile_image: null,
                      });
                      setIsOpen(true);
                    }}
                  >
                   Edit
                  </button>
                  <button
                    className="text-red-600 m-2 font-bold bg-[#deecf7] px-3 py-1 rounded-xl"
                    onClick={async () => {
                      const confirmDelete = confirm("Delete this employee?");
                      if (!confirmDelete) return;

                      await fetch(
                        `http://localhost:5000/api/employees/delete/${emp.id}`,
                        {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                          }
                        }
                      );

                      fetchEmployees();
                    }}
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#585757] text-xl font-bold">{editMode ? "Edit Employee" : "Add Employee"}</h2>
            <button
              onClick={closeDrawer}
              className="text-red-500 font-extrabold text-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              placeholder="Name"
              className="border p-3 text-[#666363]  rounded-xl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Email"
              className="text-[#666363] border p-3 rounded-xl"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              placeholder="Phone (Default Password)"
              className="text-[#666363] border p-3 rounded-xl"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              placeholder="Position"
              className="text-[#666363] border p-3 rounded-xl"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />

            <input
              type="file"
              className="text-[#666363] border p-3 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, profile_image: e.target.files?.[0] })
              }
            />


            <button
              onClick={handleSubmit}
              className="bg-purple-600 text-white py-3 rounded-2xl mt-4"
            >
              {editMode ? "Update Employee" : "Save Employee"}
            </button>

          </div>
        </div>
      </div>
      {profileOpen && profileData && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={() => setProfileOpen(false)}
          />

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-96 p-6 rounded-3xl shadow-2xl z-50">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold  text-[#000000]">Employee Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="text-[red] font-extrabold">✕</button>
            </div>

            <div className="flex flex-col items-center mb-4">
              {profileData?.employee?.profile_image && (
                <img
                  src={`http://localhost:5000/uploads/${profileData.employee.profile_image}`}
                  className="w-24 h-24 rounded-full object-cover mb-3"
                />
              )}
              <h3 className="text-[#000000] text-lg font-semibold">
                {profileData?.employee?.name}
              </h3>
              <p className="text-gray-500">
                {profileData?.employee?.position}
              </p>
            </div>

            <div className="space-y-2 text-sm text-[#000000]">
              <p><strong>Email:</strong> {profileData?.employee?.email}</p>
              <p><strong>Phone:</strong> {profileData?.employee?.phone}</p>
              <p>
                <strong>Attendance (30 days):</strong>{" "}
                {profileData?.attendancePercentage}%
              </p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
