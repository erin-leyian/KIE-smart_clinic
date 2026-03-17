import React from "react";
import { Link, useLocation } from "react-router-dom";
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
      name: "My Availability",
      path: "/dashboard/availability",
      icon: <Calendar size={18} />,
    },
    { name: "My Consults", path: "#", icon: <User size={18} /> },
    {
      name: "Online Consult",
      path: "/dashboard/consult",
      icon: <Monitor size={18} />,
    },
    { name: "Help", path: "#", icon: <HelpCircle size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <Link
            to="/"
            className="text-xl font-bold text-teal-600 flex items-center"
          >
            <Heart className="w-5 h-5 mr-2" fill="currentColor" /> QueueCare
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
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
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Hi, Dr. Nshimiyimana</p>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">EN ∨</span>
            <Bell className="text-gray-400" size={20} />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <span className="font-medium">Dr. Nshimiyimana</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
