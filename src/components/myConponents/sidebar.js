"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  User,
  Menu,
  X,
  UsersRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const activeItemRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      setTimeout(() => {
        if (!navRef.current) return;
        const containerHeight = navRef.current.clientHeight;
        const itemPosition = activeItemRef.current.offsetTop;
        const itemHeight = activeItemRef.current.clientHeight;
        navRef.current.scrollTop = itemPosition - containerHeight / 2 + itemHeight / 2;
      }, 100);
    }
  }, [pathname, expanded, mobileMenuOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/screens/dashboard" },
    { icon: Folder, label: "Projets", href: "/screens/projets" },
    { icon: CheckSquare, label: "Tâches", href: "/screens/taches" },
    { icon: UsersRound, label: "Utilisateurs", href: "/screens/users" },
    { icon: UsersRound, label: "Invités", href: "/screens/invitations" },
    { icon: User, label: "Profil", href: "/screens/profile" },
  ];

  const isActive = (href) => pathname === href;

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 bg-background p-3 bg-sky-500 text-white rounded-lg shadow-lg hover:bg-sky-600"
        >
          <Menu size={28} />
        </button>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-sky-900 bg-opacity-50 z-50 flex bg-background">
            <div className="bg-sky-500 text-white w-64 h-full overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-sky-300">
                <div className="flex items-center">
                  <div className="bg-sky-600 h-12 w-26 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    APP
                  </div>
                  <h1 className="ml-3 font-bold text-xl">Mon App</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-popover"
                >
                  <X size={28} />
                </button>
              </div>
              <nav className="flex-1 pt-4" ref={navRef}>
                <ul className="space-y-3 px-3">
                  {menuItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                      <li key={index} ref={active ? activeItemRef : null}>
                        <button
                          onClick={() => {
                            router.push(item.href);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center w-full p-4 rounded-lg transition-colors ${
                            active ? "bg-sky-600 text-white" : "hover:bg-sky-600 text-sky-100"
                          }`}
                        >
                          <item.icon size={32} className={active ? "text-white" : "text-sky-200"} />
                          <span className="ml-4 text-lg font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col text-white transition-all bg-background duration-300 fixed left-0 top-0 bottom-0 bg-sky-500 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center p-4 border-b border-sky-300 bg-background">
        <div className="bg-sky-600 h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
          APP
        </div>
        {expanded && <h1 className="ml-3 font-bold text-xl">Mon App</h1>}
        {/* <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto p-2 rounded-lg hover:bg-sky-600"
        >
          {expanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button> */}
      </div>
      <nav className="flex-1 pt-4 overflow-y-auto bg-background" ref={navRef}>
        <ul className="space-y-3 px-3">
          {menuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <li key={index} ref={active ? activeItemRef : null}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`flex items-center w-full p-4 rounded-lg transition-colors ${
                    active ? "bg-sky-600 text-white" : "hover:bg-popover"
                  }`}
                >
                  <item.icon size={32} className={active ? "text-white" : "text-sky-200"} />
                  {expanded && (
                    <span className={`ml-4 text-lg font-medium ${active ? "text-white" : "text-sky-100"}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;