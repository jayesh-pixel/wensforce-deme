import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    // Implement login logic here
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border-b-2 bg-white border-gray-300 focus:border-yellow-500 focus:outline-none"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/forgot-password" className="text-sm text-gray-600 hover:underline">
            Forgot <span className="text-yellow-500">Password?</span>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
