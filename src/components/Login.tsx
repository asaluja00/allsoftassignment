import React, { useState, useRef } from "react";

const Login: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGetOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    try {
      const res = await fetch("https://apis.allsoft.co/api/documentManagement/generateOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: phone }),
      });
      const data = await res.json();
      console.log(data.data);
      if (res.ok ) {
        setOtpSent(true);
      } else {
        setError(data.message || "Failed to generate OTP");
      }
    } catch {
      setError("Server error while generating OTP");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleValidateOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Enter the full 6-digit OTP");
      return;
    }
    setError("");
    try {
      const res = await fetch("https://apis.allsoft.co/api/documentManagement/validateOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: phone, otp: enteredOtp }),
      });
      const data = await res.json();
      console.log(data.data);
      if (res.ok && data.data.token) {
        localStorage.setItem("token", data.data.token);
        alert("Login successful!");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch {
      setError("Server error while validating OTP");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 min-h-screen min-w-screen">
      <div className="w-full max-w-sm bg-white shadow-xl rounded-xl p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">Login</h2>
        {!otpSent ? (
          <>
            <label className="w-full text-left mb-2 text-gray-700 font-medium" htmlFor="phone">
              Enter your 10-digit phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              maxLength={10}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg text-gray-900 bg-white"
              style={{ letterSpacing: "2px" }}
            />
            <button
              onClick={handleGetOtp}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mb-2"
            >
              Get OTP
            </button>
          </>
        ) : (
          <>
            <label className="w-full text-left mb-2 text-gray-700 font-medium" htmlFor="otp">
              Enter the 6-digit OTP sent to your phone
            </label>
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  className="w-10 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
                />
              ))}
            </div>
            <button
              onClick={handleValidateOtp}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-2"
            >
              Validate OTP
            </button>
          </>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Login;