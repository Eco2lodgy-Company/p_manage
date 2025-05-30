"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, List, Settings, Folder } from "lucide-react";

const Sidebar = () => {
  const router = useRouter();

  return (
    <div
      className="fixed top-0 left-0 w-64 h-screen flex flex-col shadow-md"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        color: "var(--header-text)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo/Title */}
      <div
        className="p-4"
        style={{
          borderBottom: "1px solid var(--sidebar-border)",
        }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--header-text)" }}
        >
          MyApp
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/projects")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Folder className="w-5 h-5 mr-2" />
              Projects
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/tasks")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <List className="w-5 h-5 mr-2" />
              Tasks
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;