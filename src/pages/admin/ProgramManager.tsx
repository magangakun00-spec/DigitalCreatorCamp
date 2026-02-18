// src/pages/admin/ProgramManager.tsx

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader,
  CheckCircle,
  Edit2,
  X,
} from "lucide-react";
import { useProgram, Program } from "@/context/ProgramContext";
import { useRequirements, Requirement } from "@/context/RequirementsContext";

const ICONS = [
  "📈",
  "🎨",
  "💡",
  "✍️",
  "🛒",
  "🎬",
  "📚",
  "🚀",
  "💼",
  "🌐",
  "🏆",
  "⭐",
  "🔥",
  "💪",
  "🎯",
  "🏫",
  "🎓",
  "👤",
  "✨",
];
const CATEGORIES = [
  "Marketing",
  "Creative",
  "Business",
  "Technology",
  "Lainnya",
];
const DURATIONS = ["1 Bulan", "2 Bulan", "3 Bulan", "6 Bulan", "1 Tahun"];

type ProgramForm = Omit<Program, "id">;
const EMPTY_FORM: ProgramForm = {
  name: "",
  description: "",
  category: "Marketing",
  status: "draft",
  participants: 0,
  startDate: "",
  endDate: "",
  price: "Gratis",
  duration: "3 Bulan",
  icon: "📚",
};

function getStatusColor(s: string) {
  if (s === "active")
    return "bg-green-500/20 text-green-400 border border-green-500/50";
  if (s === "draft")
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
  if (s === "inactive")
    return "bg-red-500/20 text-red-400 border border-red-500/50";
  return "bg-slate-500/20 text-slate-400";
}
function getStatusLabel(s: string) {
  if (s === "active") return "Aktif";
  if (s === "draft") return "Draft";
  if (s === "inactive") return "Tidak Aktif";
  return s;
}

export default function ProgramManager() {
  const {
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    isLoading: loadingPrograms,
  } = useProgram();
  const {
    requirements,
    saveRequirements,
    isLoading: loadingReq,
  } = useRequirements();

  // Program form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProgramForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirements state
  const [localReqs, setLocalReqs] = useState<Requirement[]>([]);
  const [isSavingReqs, setIsSavingReqs] = useState(false);
  const [savedReqMsg, setSavedReqMsg] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  useEffect(() => {
    setLocalReqs([...requirements]);
  }, [requirements]);

  // ── Program handlers ──
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  };
  const openEdit = (prog: Program) => {
    const { id, ...rest } = prog;
    setFormData(rest);
    setEditingId(id);
    setError(null);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError(null);
  };
  const set = (key: keyof ProgramForm, val: string | number) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleSaveProgram = async () => {
    if (!formData.name.trim()) {
      setError("Nama program tidak boleh kosong!");
      return;
    }
    if (!formData.description.trim()) {
      setError("Deskripsi tidak boleh kosong!");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Tanggal mulai & selesai harus diisi!");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      if (editingId) {
        await updateProgram(editingId, formData);
      } else {
        await addProgram(formData);
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return;
    try {
      await deleteProgram(id);
    } catch {
      alert("Gagal menghapus");
    }
  };

  // ── Requirements handlers ──
  const addReq = () => {
    setLocalReqs((prev) => [
      ...prev,
      { id: "new-" + Date.now(), text: "Syarat baru", order: prev.length + 1 },
    ]);
  };
  const updateReqText = (id: string, text: string) =>
    setLocalReqs((prev) => prev.map((r) => (r.id === id ? { ...r, text } : r)));
  const removeReq = (id: string) =>
    setLocalReqs((prev) => prev.filter((r) => r.id !== id));

  const handleSaveReqs = async () => {
    try {
      setIsSavingReqs(true);
      setReqError(null);
      const cleaned = localReqs.map((r, i) => ({ ...r, order: i + 1 }));
      await saveRequirements(cleaned);
      setSavedReqMsg(true);
      setTimeout(() => setSavedReqMsg(false), 3000);
    } catch (err) {
      setReqError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSavingReqs(false);
    }
  };

  if (loadingPrograms || loadingReq) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Program Manager</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Kelola kartu program & syarat pendaftaran di landing page
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
          >
            <Plus size={18} /> Tambah Program
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {savedMsg && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg px-4 py-3">
            <CheckCircle size={18} /> Program berhasil disimpan!
          </div>
        )}

        {/* ── FORM PROGRAM ── */}
        {showForm && (
          <div className="bg-slate-800 rounded-2xl border border-blue-500/50 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{formData.icon}</span>
                <div>
                  <h2 className="text-white font-bold">
                    {editingId ? "Edit Program" : "Tambah Program Baru"}
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Status Aktif = tampil di landing page
                  </p>
                </div>
              </div>
              <button
                onClick={closeForm}
                aria-label="Tutup Form"
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pilih Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => set("icon", emoji)}
                      className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                        formData.icon === emoji
                          ? "border-blue-500 bg-blue-500/20 scale-110"
                          : "border-slate-600 bg-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Nama *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="contoh: Siswa SMK"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="contoh: Jurusan Marketing, DKV, RPL, atau lainnya"
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm mb-1 text-slate-300"
                  >
                    Kategori
                  </label>

                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm mb-1 text-slate-300"
                  >
                    Status Program
                  </label>

                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      set("status", e.target.value as Program["status"])
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">
                      ✅ Aktif — tampil di landing page
                    </option>
                    <option value="draft">🟡 Draft — tidak tampil</option>
                    <option value="inactive">🔴 Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm mb-1 text-slate-300"
                  >
                    Durasi Program
                  </label>

                  <select
                    id="duration"
                    value={formData.duration ?? "3 Bulan"}
                    onChange={(e) => set("duration", e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Biaya
                  </label>
                  <input
                    type="text"
                    value={formData.price ?? ""}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="Gratis"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm mb-1 text-slate-300"
                  >
                    Tanggal Mulai
                  </label>

                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm mb-1 text-slate-300"
                  >
                    Tanggal Selesai
                  </label>

                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={closeForm}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProgram}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 text-sm"
              >
                {isSaving ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editingId ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        )}

        {/* ── DAFTAR PROGRAM ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-white font-bold">Kartu Program</h2>
            <p className="text-slate-400 text-sm">
              Tampil di landing page jika status{" "}
              <span className="text-green-400">Aktif</span>
            </p>
          </div>
          {programs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Belum ada program. Klik "Tambah Program".
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-700/30 transition-colors group"
                >
                  <span className="text-3xl flex-shrink-0">
                    {prog.icon ?? "📚"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">
                        {prog.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                          prog.status
                        )}`}
                      >
                        {getStatusLabel(prog.status)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm truncate">
                      {prog.description}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(prog)}
                      aria-label="Edit Program"
                      className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-blue-400"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(prog.id, prog.name)}
                      aria-label="Hapus Program"
                      className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SYARAT PENDAFTARAN ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold">Syarat Pendaftaran</h2>
              <p className="text-slate-400 text-sm">
                Checklist di sebelah kanan landing page
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savedReqMsg && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle size={14} /> Tersimpan!
                </span>
              )}
              <button
                onClick={addReq}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-lg"
              >
                <Plus size={14} /> Tambah
              </button>
              <button
                onClick={handleSaveReqs}
                disabled={isSavingReqs}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50"
              >
                {isSavingReqs ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}{" "}
                Simpan
              </button>
            </div>
          </div>

          {reqError && (
            <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm">
              {reqError}
            </div>
          )}

          <div className="p-6 space-y-3">
            {localReqs.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600"
              >
                <CheckCircle
                  size={16}
                  className="text-green-400 flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="Tulis requirement..."
                  aria-label="Requirement"
                  value={req.text}
                  onChange={(e) => updateReqText(req.id, e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                />

                <button
                  onClick={() => removeReq(req.id)}
                  aria-label="Hapus Requirement"
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {localReqs.length === 0 && (
              <p className="text-center text-slate-500 py-4 text-sm">
                Belum ada syarat. Klik "Tambah".
              </p>
            )}
          </div>
        </div>

        {/* ── PREVIEW ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Preview Landing Page</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-3">
              {programs
                .filter((p) => p.status === "active")
                .map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-slate-700 p-4 rounded-xl border border-slate-600"
                  >
                    <div className="text-2xl mb-2">{prog.icon}</div>
                    <p className="font-semibold text-white text-sm">
                      {prog.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                      {prog.description}
                    </p>
                  </div>
                ))}
              {programs.filter((p) => p.status === "active").length === 0 && (
                <p className="col-span-2 text-slate-500 text-sm text-center py-4">
                  Tidak ada program aktif
                </p>
              )}
            </div>
            <div className="bg-slate-700 p-5 rounded-xl border border-slate-600">
              <p className="font-bold text-white mb-3">Syarat Pendaftaran</p>
              <div className="space-y-2">
                {localReqs.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span className="text-slate-300 text-sm">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
