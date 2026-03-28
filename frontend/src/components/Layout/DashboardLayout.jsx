import React from "react";
import { Link, useLocation } from "react-router-dom";
import mockData from "../../data/mockData.json";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  User,
  Monitor,
  HelpCircle,
  Heart,
  LogOut,
  Bell,
  Search,
  MapPin,
  Settings,
} from "lucide-react";

export default function DashboardLayout({ children, title }) {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Patient Records",
      path: "/dashboard/records",
      icon: <FileText size={18} />,
    },
    {
      name: "Calendar",
      path: "/dashboard/calendar",
      icon: <Calendar size={18} />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <User size={18} />,
    },
    {
      name: "Online Consult",
      path: "/dashboard/consult",
      icon: <Monitor size={18} />,
    },
    { name: "Help", path: "/dashboard/help", icon: <HelpCircle size={18} /> },
  ];

  const user = mockData.users?.[0] || {
    name: "Stevan dux",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col flex-shrink-0">
        <div className="p-6 border-b">
          <Link
            to="/"
            className="text-xl font-bold text-teal-600 flex items-center"
          >
            <Heart className="w-5 h-5 mr-2" fill="currentColor" /> QueueCare
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white px-8 py-5 flex items-center justify-between gap-6 border-b flex-shrink-0">
          <div className="flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Hi, {user.name}
            </p>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              {title === "Dashboard" ? "Welcome Back" : title}
            </h1>
          </div>

          <div className="flex-1 max-w-[600px] ml-4">
            <div className="flex items-center bg-[#f4f7f8] rounded-xl p-1 border border-gray-100/50">
              <div className="flex items-center flex-1 px-4 py-2 border-r border-gray-200/60">
                <Search className="text-gray-400 w-4 h-4 mr-3" />
                <input
                  type="text"
                  placeholder="Find doctors"
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 focus:ring-0"
                />
              </div>
              <div className="flex items-center flex-1 px-4 py-2">
                <MapPin className="text-gray-400 w-4 h-4 mr-3" />
                <input
                  type="text"
                  placeholder="Location"
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 focus:ring-0"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="bg-[#389cb4] hover:bg-[#328c9f] text-white px-7 py-2.5 rounded-lg text-sm font-medium transition-colors ml-1">
                Search
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-5 text-sm flex-shrink-0">
            <button className="flex items-center space-x-1 text-gray-600 font-medium">
              <span>EN</span>
              <span className="text-xs">∨</span>
            </button>
            <button className="relative p-1 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-[2px] right-[2px] w-2 h-2 bg-red-400 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-3">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-100"
              />
              <span className="font-semibold text-[15px] text-[#1a1a1a]">
                {user.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
