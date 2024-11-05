import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"; // Use useRouter from Next.js

const OtpPage = () => {
  const [otp, setOtp] = useState(new Array(4).fill("")); // Array to store OTP digits
  const [timer, setTimer] = useState(30); // Initialize timer with 30 seconds
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const inputRefs = useRef([]); // To store refs for each input field
  const router = useRouter();
  const phoneNumber = router.query.phoneNumber; // Access phone number from query parameter

  useEffect(() => {
    if (!phoneNumber) {
      // Redirect to login if no phone number is provided
      router.push("/login");
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setIsButtonDisabled(true); // Disable the button when timer runs out
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Cleanup interval when the component unmounts
    return () => clearInterval(countdown);
  }, [phoneNumber, router]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return; // Ensure that only numbers are allowed

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically move to the next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    // Combine the OTP array into a single string
    const otpValue = otp.join("");
    console.log("Phone Number:", phoneNumber);
    console.log("Entered OTP:", otpValue);

    // Implement OTP verification logic here using Firebase or your backend
    // On successful OTP verification, redirect to dashboard or desired page
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Enter OTP</h2>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex justify-between space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="\d{1}"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)} // Store refs for each input
                className="w-12 h-12 text-center text-2xl border-2 bg-white border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none rounded-md transition-colors duration-200"
                disabled={isButtonDisabled} // Disable input if timer runs out
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Time remaining: {timer} seconds</p>
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity ${
              isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isButtonDisabled} // Disable button if timer runs out
          >
            Verify OTP
          </button>

          {isButtonDisabled && (
            <div className="text-center mt-4">
              <p className="text-sm text-red-500">OTP expired! Request a new OTP.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OtpPage;
