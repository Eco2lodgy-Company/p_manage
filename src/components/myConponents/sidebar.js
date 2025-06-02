
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Folder, List, Users, DollarSign, Package, Settings, LogOut } from "lucide-react";

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
              onClick={() => router.push("/screens/projets")}
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
              onClick={() => router.push("/screens/taches")}
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
              onClick={() => router.push("/screens/crm")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Users className="w-5 h-5 mr-2" />
              CRM
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/taches")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Comptabilité
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/users")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Users className="w-5 h-5 mr-2" />
              Ressources Humaines
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/screens/tools")}
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Package className="w-5 h-5 mr-2" />
              Ressources Matérielles
            </button>
          </li>
        </ul>
      </nav>

      {/* Settings and Logout Section */}
      <div className="p-4 border-t border-border">
        <ul className="space-y-2">
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
          <li>
            <button
              onClick={() => router.push("/settings")} // Replace with logout route
              className="flex items-center w-full p-2 text-left rounded-md transition-colors"
              style={{
                color: "var(--header-text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--sidebar-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Se déconnecter
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
