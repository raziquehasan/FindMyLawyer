import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    enrollmentNumber: "",
    role: "lawyer",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);
      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input"
          onChange={handleChange}
          required
        />

        <input
          name="enrollmentNumber"
          placeholder="Enrollment Number (Lawyer only)"
          className="input"
          onChange={handleChange}
        />

        <button className="w-full bg-blue-600 text-white py-2 mt-4 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
