import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import logo from "../assets/images/iit_ropar_logo.jpg";

export default function VerifySignupOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve data passed from Signup page
  const signupData = location.state; // email, full_name, role, etc.
  
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef([]);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ===============================
      OTP Input Handlers
  =============================== */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Session Check
  if (!signupData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 border border-gray-300 text-center w-full max-w-sm shadow-sm">
          <p className="text-red-600 font-semibold mb-4 text-sm">
            Session expired. Please signup again.
          </p>
          <button
            onClick={() => navigate("/signup", { replace: true })}
            className="bg-black text-white px-6 py-2 w-full text-sm font-semibold"
          >
            Go to Signup
          </button>
        </div>
      </div>
    );
  }

  const verify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/signup/verify-otp", {
        ...signupData,
        otp: otpValue
      });

      alert(res.data.message || "Signup successful! Please wait for Admin approval.");
      navigate("/login", { replace: true });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post("/auth/signup/request-otp", signupData);
      setTimer(30);
      alert("New OTP sent!");
    } catch (err) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
      
      {/* LEFT BRAND PANEL (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-white border-r border-gray-300 px-12 text-center">
        <img src={logo} alt="IIT Ropar Logo" className="w-40 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900">
          Indian Institute of Technology Ropar
        </h1>
        <p className="text-gray-600 mt-4 max-w-md">
          Academic Management Portal - Account Registration
        </p>
      </div>

      {/* RIGHT OTP PANEL */}
      <div className="flex items-center justify-center p-4 md:px-6 md:py-12">
        <div className="w-full max-w-lg bg-white border border-gray-300 p-6 md:p-10 shadow-sm">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="IIT Ropar Logo" className="w-20" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold mb-1 text-center md:text-left">
            Verify Signup
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-8 text-center md:text-left">
            A verification code has been sent to <br className="md:hidden" />
            <b className="text-gray-900">{signupData.email}</b>
          </p>

          {/* 6-DIGIT OTP INPUTS */}
          <div className="flex justify-center gap-2 md:gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 md:w-14 md:h-14 border border-gray-400 text-center text-lg md:text-xl font-bold focus:outline-none focus:border-black rounded-none transition-all"
              />
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-4">
            <button
              onClick={verify}
              disabled={loading}
              className={`w-full py-3 text-white font-semibold transition shadow-sm ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
              }`}
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-center text-xs md:text-sm gap-2">
              <span className="text-gray-500">Didn't receive code?</span>
              <button
                onClick={resendOtp}
                disabled={timer > 0}
                className={`font-semibold ${
                  timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"
                }`}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/signup", { replace: true })}
                className="w-full text-gray-600 py-2 border border-gray-300 hover:bg-gray-50 transition text-xs md:text-sm font-medium"
              >
                Back to Signup
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}