"use client";

import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useContact, ContactInfo } from "@/context/ContactContext";
import {
  Menu,
  X,
  Users,
  LogOut,
  Home,
  Bell,
  Search,
  BookOpen,
  Edit3,
  UserCog,
} from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [adminFormError, setAdminFormError] = useState("");

  const { contact, updateContact } = useContact();
  const [contactForm, setContactForm] = useState<ContactInfo>(contact);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/admin",
    },
    {
      id: "program",
      label: "Program",
      icon: BookOpen,
      href: "/admin/program",
    },
    {
      id: "testimoni",
      label: "Testimoni",
      icon: Users,
      href: "/admin/testimoni",
    },
    {
      id: "magang",
      label: "Komisi Magang",
      icon: Edit3,
      href: "/admin/magang",
    },
    {
      id: "info-admin",
      label: "Informasi Admin",
      icon: UserCog,
      href: "/admin/info-admin",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveAdmin = async () => {
    setAdminFormError("");
    if (
      !contactForm.phone_display.trim() ||
      !contactForm.email.trim() ||
      !contactForm.instagram.trim()
    ) {
      setAdminFormError("Semua field wajib diisi.");
      return;
    }
    const { error } = await updateContact(contactForm);
    if (error) {
      setAdminFormError("Gagal menyimpan: " + error);
      return;
    }
    setShowEditAdmin(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-700 transition-all duration-300 ease-in-out flex flex-col shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="h-20 border-b border-slate-700 flex items-center justify-between px-4">
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                DCC
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            if (item.id === "info-admin") {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setContactForm({ ...contact });
                    setAdminFormError("");
                    setShowEditAdmin(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <IconComponent size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <IconComponent size={20} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-700 p-3 space-y-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors group"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-8 shadow-lg">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700 hover:border-blue-500 transition-colors">
              <Search size={18} className="text-slate-400" />
              <label htmlFor="admin-search" className="sr-only">
                Search admin panel
              </label>
              <input
                id="admin-search"
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-slate-300 placeholder-slate-500 w-32"
                aria-label="Search admin panel"
              />
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              aria-label="View notifications"
            >
              <Bell size={20} />
              <span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                aria-hidden="true"
              ></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  {user?.user_metadata?.username || user?.email || "Admin"}
                </p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <div
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold cursor-pointer hover:shadow-lg transition-shadow"
                role="button"
                tabIndex={0}
                aria-label="Open user profile menu"
              >
                {user?.user_metadata?.username?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-white mb-2">
              Confirm Logout
            </h2>
            <p className="text-slate-300 mb-6">
              Apakah Anda yakin ingin logout dari admin panel?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Informasi Admin Modal */}
      {showEditAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <UserCog size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Informasi Admin
                  </h2>
                  <p className="text-xs text-slate-400">
                    Edit kontak di section Hubungi Kami
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditAdmin(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                aria-label="Tutup modal informasi admin"
              >
                <X size={18} />
              </button>
            </div>
            {/* Form */}
            <div className="space-y-4">
              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  type="text"
                  value={contactForm.phone_display}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      phone_display: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+62 812-3456-7890"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format: +62 8xx-xxxx-xxxx (angka akan otomatis jadi link
                  WhatsApp)
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="info@digimagang.id"
                />
              </div>

              {/* Instagram handle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Instagram (tampilan)
                </label>
                <input
                  type="text"
                  value={contactForm.instagram}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      instagram: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="@digimagang.id"
                />
              </div>

              {/* Instagram URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  URL Instagram
                </label>
                <input
                  type="text"
                  value={contactForm.instagram_url}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      instagram_url: e.target.value,
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://instagram.com/digimagang.id"
                />
              </div>

              {/* Error message */}
              {adminFormError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {adminFormError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEditAdmin(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdmin}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2"
              >
                <UserCog size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
