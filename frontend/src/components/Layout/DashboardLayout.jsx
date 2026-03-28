import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const languages = ["EN", "FR", "RW"];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to All Doctors page with search query as URL parameter
      navigate(`/dashboard/doctors?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "All Doctors",
      path: "/dashboard/doctors",
      icon: <Heart size={18} />,
    },
    {
      name: "All Appointments",
      path: "/dashboard/appointments",
      icon: <Calendar size={18} />,
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
            <div className="flex items-center bg-[#f4f7f8] rounded-xl border border-gray-100/50 px-4 py-2">
              <input
                type="text"
                placeholder="Find doctors by name, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 focus:ring-0"
              />
              <button 
                onClick={handleSearch}
                className="ml-2 p-2 text-gray-400 hover:text-[#389cb4] transition-colors flex-shrink-0"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm flex-shrink-0">
            {/* Language Selector with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdown(!languageDropdown)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer font-medium text-gray-700"
              >
                <span>{selectedLanguage}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${languageDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Language Dropdown Menu */}
              {languageDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setLanguageDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-teal-50 text-teal-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang === 'EN' ? 'English' : lang === 'FR' ? 'Français' : 'Kinyarwanda'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell with Badge */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            </button>

            {/* User Info without Avatar */}
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="font-semibold text-[15px] text-[#1a1a1a] leading-tight">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400">Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
