import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = (event) => {
    event.preventDefault();
    // Implement your forgot password logic here
    console.log("Password reset email sent to:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to receive password reset instructions.
        </p>
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border-b-2 bg-white border-gray-300 focus:border-yellow-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Reset Password
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm">
            Remembered your password?{" "}
            <Link to="/login" className="text-yellow-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
