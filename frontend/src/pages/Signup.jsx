import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/iit_ropar_logo.jpg";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "Student",
    department: "",
    batch: "",
    entry_no: ""
  });

  const [loading, setLoading] = useState(false);

  /* =========================================================
      ✅ AUTO-LOGIN CHECK (For Signup Page too)
  ========================================================= */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const sendOtp = async () => {
    const isStudent = form.role === "Student";
    if (
      !form.email ||
      !form.full_name ||
      !form.department ||
      (isStudent && (!form.batch || !form.entry_no))
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (!form.email.endsWith("@iitrpr.ac.in")) {
      alert("Email must be from IIT Ropar domain (@iitrpr.ac.in)");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup/request-otp", form);
      navigate("/verify-signup", { state: form });
    } catch (err) {
      alert(err.response?.data?.error || "Signup OTP failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">

      {/* ================= LEFT BRANDING PANEL (Hidden on Mobile) ================= */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-white border-r border-gray-300 px-12">
        <img src={logo} alt="IIT Ropar Logo" className="w-40 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Indian Institute of Technology Ropar
        </h1>
        <p className="text-gray-600 mt-4 text-center max-w-md">
          Academic Management Portal
        </p>
      </div>

      {/* ================= RIGHT SIGNUP FORM ================= */}
      <div className="flex items-center justify-center p-4 md:px-6 md:py-12">
        <div className="w-full max-w-2xl bg-white border border-gray-300 p-6 md:p-10 shadow-sm">

          {/* Mobile Header Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="IIT Ropar Logo" className="w-20" />
          </div>

          {/* Header */}
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold mb-1">Create Account</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-8">
              Sign up using your institute credentials
            </p>
          </div>

          {/* ================= BASIC DETAILS ================= */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-[10px] md:text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest border-b pb-1">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none transition"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />

              <input
                type="email"
                className="border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none transition"
                placeholder="Institute Email (@iitrpr.ac.in)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <select
                className="border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-black focus:outline-none transition"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Advisor">Advisor</option>
              </select>

              <select
                className="border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-black focus:outline-none transition"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Chemical">Chemical</option>
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="Metallurgy">Metallurgy</option>
                <option value="HSS">HSS</option>
              </select>
            </div>
          </div>

          {/* ================= STUDENT DETAILS ================= */}
          {form.role === "Student" && (
            <div className="mb-8 md:mb-10 border border-gray-200 bg-gray-50 p-4 md:p-6 rounded">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest border-b pb-1">
                Student Academic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-black focus:outline-none transition"
                  placeholder="Batch (e.g. 2023)"
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                />

                <input
                  className="border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-black focus:outline-none transition"
                  placeholder="Entry Number (e.g. 2023CSB1001)"
                  value={form.entry_no}
                  onChange={(e) => setForm({ ...form, entry_no: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ================= ACTION ================= */}
          <div className="space-y-4">
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full md:w-auto md:px-16 py-3 bg-black text-white text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 mx-auto block"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs md:text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Login here
                </button>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}