import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router'; // Import react-hot-toast
import { db } from '@/Firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { AuthContext } from '@/context/AuthContext';

const Login = ({ onClose }) => {
  const { login,user } = useContext(AuthContext); // Access login function from AuthContext
  const router = useRouter();

  // State variables
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91'); // Default to India
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Regex for phone number validation
  const phoneRegex = /^[1-9]\d{9}$/;

  // Combined phone number with country code
  const combinedNumber = `+${countryCode}${phoneNumber}`;

  // Handle phone number input
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPhoneNumber(value.slice(0, 10)); // Allow only 10 digits
      if (error) setError('');
    }
  };

  // Handle OTP input
  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setOtp(value.slice(0, 4)); // Allow only 6 digits
      if (otpError) setOtpError('');
    }
  };

  // Validate phone number
  const validatePhoneNumber = () => {
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number starting with 1-9.');
      return false;
    }
    return true;
  };

  // Send OTP using Next.js API route
  const sendOtp = async () => {
    setIsLoading(true);
    setError(''); // Clear previous errors
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: `${countryCode}${phoneNumber}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP. Please try again.');
      }

      toast.success(`OTP sent successfully to ${combinedNumber}`); // Success toaster
      setOtpSent(true);
      
      // Start resend cooldown (e.g., 60 seconds)
      setResendCooldown(60);
    } catch (error) {
      console.error('Error sending OTP:', error);

      // Handle network errors specifically
      if (error.message === 'Failed to fetch') {
        setError('Network error: Unable to reach the server. Please check your internet connection and try again.');
      } else {
        setError(`Error: ${error.message}`);
      }

      toast.error(`Error: ${error.message}`); // Error toaster
    } finally {
      setIsLoading(false);
    }
  };

// Verify OTP using Next.js API route
const verifyOtp = async () => {
  setIsLoading(true);
  setOtpError(''); // Clear previous OTP errors
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otp: otp,
        mobile: `${countryCode}${phoneNumber}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP. Please try again.');
    }

    toast.success('OTP verified successfully!'); // Success toaster

    // Check if the phone number already exists in Firestore
    const docRef = doc(db, "client", `${countryCode}${phoneNumber}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // If document does not exist, add it
      await setDoc(docRef, { 
        phone: `${countryCode}${phoneNumber}` 
      });
     // toast.success('Phone number saved in database.');
    } else {
     // toast.info('Phone number already exists in the database.'); // Optional info toast
    }
    login(`${countryCode}${phoneNumber}`);
    onClose(); // Close the modal after successful login
  } catch (error) {

    // Handle network errors specifically
    if (error.message === 'Failed to fetch') {
      setOtpError('Network error: Unable to reach the server. Please check your internet connection and try again.');
    } else {
      setOtpError(`Error: ${error.message}`);
    }

    toast.error(`Error: ${error.message}`); // Error toaster
  } finally {
    setIsLoading(false);
  }
};

  // Handle form submission for phone number
  const handleLogin = (event) => {
    event.preventDefault();

    if (!validatePhoneNumber()) {
      return;
    }

    // Send OTP to the entered phone number
    sendOtp();
  };

  // Handle OTP resend
  const handleResendOtp = () => {
    if (resendCooldown === 0) {
      sendOtp();
    }
  };

  // Countdown for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className="flex w-full h-full bg-gray-100">
      <div className="bg-white p-8 rounded-xl  w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          {otpSent ? 'Verify OTP' : 'Phone Number Login'}
        </h2>

        {!otpSent ? (
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="countryCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country Codeadasdsa
              </label>
              <select
                id="countryCode"
                name="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full mt-1 p-2 bg-white text-black border border-gray-300 rounded-md focus:border-yellow-500 focus:outline-none transition-colors duration-200"
              >
                <option value="91">+91 (India)</option>
                <option value="1">+1 (USA)</option>
                <option value="44">+44 (UK)</option>
                <option value="61">+61 (Australia)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Numbersdfsdfsdfsdfsdf
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                inputMode="numeric"
                maxLength="10"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby="phoneNumber-error"
                className={`w-full mt-1 p-2 bg-white text-black border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:border-yellow-500 focus:outline-none transition-colors duration-200`}
                placeholder="Enter your 10-digit phone number"
              />
              {error && (
                <p
                  id="phoneNumber-error"
                  className="mt-1 text-sm text-red-500"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center ${
                isLoading || phoneNumber.length !== 10
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
              disabled={isLoading || phoneNumber.length !== 10}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Sending OTP...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await verifyOtp();
            }}
            className="space-y-6"
            noValidate
          >
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                required
                inputMode="numeric"
                maxLength="4"
                aria-invalid={otpError ? 'true' : 'false'}
                aria-describedby="otp-error"
                className={`w-full mt-1 p-2 bg-white text-black border ${
                  otpError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:border-yellow-500 focus:outline-none transition-colors duration-200`}
                placeholder="Enter the 4-digit OTP"
              />
              {otpError && (
                <p
                  id="otp-error"
                  className="mt-1 text-sm text-red-500"
                  role="alert"
                >
                  {otpError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center ${
                isLoading || otp.length !== 4
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              }`}
              disabled={isLoading || otp.length !== 4}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Verifying OTP...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendOtp}
                className={`text-sm text-blue-500 hover:underline ${
                  resendCooldown > 0 ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setOtpError('');
                  setError('');
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Change Number
              </button>
            </div>
          </form>
        )}

        {/* Additional Error Message */}
        {error && !otpSent && (
          <div className="mt-4 text-red-500 text-center">{error}</div>
        )}
      </div>
    </div>
  );
};

export default Login;
