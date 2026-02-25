"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
}
,
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);
    
    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-pink-200 to-purple-200">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-80">
        <h1 className="text-2xl text-[#c18aee] font-bold mb-4 text-center">Login</h1>
        <input
          className="text-[#534f4f] border p-2 w-full mb-3 rounded-xl placeholder-[#a49eaa]"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="text-[#534f4f] border p-2 w-full mb-4 rounded-xl placeholder-[#a49eaa]"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-purple-500 text-white w-full py-2 rounded-2xl"
        >
          Login
        </button>
      </div>
    </div>
  );
}
