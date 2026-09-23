import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Heart, FileText, User, Info } from "lucide-react";
// import './index.css';   // ย้ายไป styles/global.css ที่ main.jsx
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  const location = useLocation();

  const tabs = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/favorite", icon: Heart, label: "Favorites" },
    { path: "/status", icon: FileText, label: "Status" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/about", icon: Info, label: "About" }, 
  ];

  return (
    <div className="app-layout">
      <div className="page-background"></div>

      <div className="tabbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              title={tab.label}
              className={isActive ? "active" : ""}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </div>

      <div className="main-content-area">
        <Outlet />
      </div>

      <SpeedInsights />
    </div>
  );
}