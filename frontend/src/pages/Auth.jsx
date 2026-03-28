import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Heart, Calendar, X, Apple, Facebook } from "lucide-react";
import mockData from "../data/mockData.json";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsLogin(params.get("mode") !== "signup");
  }, [location]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      
      const payload = isLogin 
        ? { email, password }
        : { email, password, username: email.split('@')[0] }; // Mocking username since it's required usually

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }

      // Store token on success
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side hero */}
      <div className="w-1/2 bg-[#8CB8C2] p-12 text-white relative flex flex-col justify-between hidden md:flex">
        <div className="mt-24">
          <div className="bg-gray-800/50 backdrop-blur inline-block p-4 rounded-xl mb-8">
            <h3 className="font-bold">Well qualified doctors</h3>
            <p className="text-sm opacity-80">Treat with utmost care</p>
          </div>
          <h1 className="text-5xl font-bold mb-4 flex items-center">
            <Heart className="w-12 h-12 mr-3" fill="currentColor" /> QueueCare
          </h1>
        </div>

        <div className="bg-gray-800/80 backdrop-blur inline-block p-4 rounded-xl mt-auto self-start w-64">
          <h3 className="font-bold flex items-center">
            <Calendar className="w-5 h-5 mr-2" /> Book an appointment
          </h3>
          <p className="text-sm opacity-80 mt-1">Call/text/video/in-person</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center relative">
        <Link
          to="/"
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-800"
        >
          <X className="w-6 h-6" />
        </Link>
        <div className="w-full max-w-[400px] px-8">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
            {isLogin ? "Welcome back" : "Hey there"}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isLogin ? "New to QueueCare? " : "Already know QueueCare? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-teal-500 hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>

          <form className="space-y-4" onSubmit={handleAuth}>
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="example@kigali.rw"
                className="w-full border p-2 rounded-md focus:outline-teal-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                <div className="flex border rounded-md focus-within:ring-1 ring-teal-500">
                  <select className="bg-gray-50 border-r px-2 py-2 outline-none">
                    <option>🇷🇼 +250</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="788 123 456"
                    className="flex-1 p-2 outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Your password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border p-2 rounded-md focus:outline-teal-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-md focus:outline-teal-500"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white rounded-md py-2 hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : (isLogin ? "Log in" : "Sign Up")}
            </button>

            {isLogin && (
              <div className="flex justify-between items-center mt-4">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <a href="#" className="text-sm text-teal-500 hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
          </form>

          <div className="mt-8">
            <p className="text-center text-sm text-gray-500 mb-4">
              {isLogin ? "Or log in with" : "Or sign up with"}
            </p>
            <div className="flex space-x-4">
              <button className="flex-1 border py-2 rounded-md hover:bg-gray-50 flex justify-center items-center font-bold">
                G
              </button>
              <button className="flex-1 border py-2 rounded-md hover:bg-gray-50 text-blue-600 flex justify-center items-center">
                <Facebook className="w-5 h-5" fill="currentColor" />
              </button>
              <button className="flex-1 border py-2 rounded-md hover:bg-gray-50 text-black flex justify-center items-center">
                <Apple className="w-5 h-5" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
