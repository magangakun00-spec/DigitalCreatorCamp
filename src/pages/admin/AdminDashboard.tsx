"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, MessageSquareQuote, Clock } from "lucide-react";
import { useProgram } from "@/context/ProgramContext";
import { useTestimoni } from "@/context/TestimoniContext";

// ──────────────────────────────────────────────
// Typewriter hook
// ──────────────────────────────────────────────
function useTypewriter(text: string, speed = 60) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ──────────────────────────────────────────────
// Real-time clock hook
// ──────────────────────────────────────────────
function useRealTimeClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function AdminDashboard() {
  const now = useRealTimeClock();

  // ── Real data from context ──
  const { programs } = useProgram();
  const { testimoni } = useTestimoni();

  const totalPrograms = programs.filter((p) => p.status === "active").length;
  const totalTestimoni = testimoni.length;

  // ── Export Report as CSV ──
  const handleExportReport = () => {
    const now = new Date();
    const timestamp = now.toLocaleDateString("id-ID").replace(/\//g, "-");

    // Programs CSV
    const programHeaders = ["ID", "Nama Program", "Deskripsi", "Status"];
    const programRows = programs.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${(p.description ?? "").replace(/"/g, '""')}"`,
      p.status,
    ]);
    const programCSV = [
      programHeaders.join(","),
      ...programRows.map((r) => r.join(",")),
    ].join("\n");

    // Testimoni CSV
    const testimoniHeaders = ["ID", "Author", "Status"];
    const testimoniRows = testimoni.map((t) => [
      t.id,
      `"${t.author}"`,
      t.status,
    ]);
    const testimoniCSV = [
      testimoniHeaders.join(","),
      ...testimoniRows.map((r) => r.join(",")),
    ].join("\n");

    const fullCSV = `LAPORAN ADMIN DASHBOARD - ${timestamp}\n\n=== DATA PROGRAM ===\n${programCSV}\n\n=== DATA TESTIMONI ===\n${testimoniCSV}`;

    const blob = new Blob([fullCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-admin-${timestamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Typewriter welcome ──
  const { displayed, done } = useTypewriter(
    "Selamat Datang di Halaman Admin!",
    70
  );

  // Stat card config
  const statCards = [
    {
      label: "Program Tersedia",
      value: totalPrograms.toString(),
      icon: BookOpen,
      sub: "Program aktif",
      accent: "from-violet-500 to-purple-400",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      label: "Total Testimoni",
      value: totalTestimoni.toString(),
      icon: MessageSquareQuote,
      sub: "Semua testimoni tersimpan",
      accent: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Waktu & Tanggal",
      value: formatTime(now),
      icon: Clock,
      sub: formatDate(now),
      accent: "from-amber-500 to-orange-400",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      isLive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-slate-800 via-blue-900/30 to-slate-800 border border-slate-700 rounded-xl p-8 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-lg text-blue-300 font-mono min-h-[1.75rem]">
              {displayed}
              {!done && (
                <span className="inline-block w-0.5 h-5 bg-blue-400 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Pantau dan kelola semua data platform dari sini.
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-blue-500/50 shrink-0"
            aria-label="Export admin dashboard report"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group relative overflow-hidden"
            >
              {/* Subtle gradient top bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 text-sm font-semibold">
                  {stat.label}
                </h3>
                <div
                  className={`p-3 ${stat.iconBg} rounded-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={20} className={stat.iconColor} />
                </div>
              </div>

              <div className="mb-3">
                <p
                  className={`text-3xl font-bold text-white tabular-nums ${
                    stat.isLive ? "tracking-wider font-mono" : ""
                  }`}
                >
                  {stat.value}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {stat.isLive && (
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  </span>
                )}
                <span className="text-sm text-slate-400">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
