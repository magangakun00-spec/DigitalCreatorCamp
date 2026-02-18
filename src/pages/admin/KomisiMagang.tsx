// src/pages/admin/KomisiMagang.tsx
// UPDATED VERSION - Uses Context instead of API

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useKomisiMagang,
  KomisiMagangData,
} from "@/context/KomisiMagangContext";

export default function KomisiManager() {
  const navigate = useNavigate();
  const {
    data,
    updateData,
    isLoading,
    error: contextError,
  } = useKomisiMagang();

  const [formData, setFormData] = useState<KomisiMagangData>({
    komisiTitle: "Komisi Per Penutupan",
    komisiSubtitle: "Transparan & Langsung Dibayar",
    komisiPoints: [],
    potensiTitle: "Potensi Penghasilan",
    potensiSubtitle: "Semakin Rajin, Semakin Besar",
    potensiRanges: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from context
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handlePointChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      komisiPoints: prev.komisiPoints.map((point) =>
        point.id === id ? { ...point, text: value } : point
      ),
    }));
  };

  const handleAddPoint = () => {
    const newId = Date.now().toString();
    setFormData((prev) => ({
      ...prev,
      komisiPoints: [...prev.komisiPoints, { id: newId, text: "Poin baru" }],
    }));
  };

  const handleRemovePoint = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      komisiPoints: prev.komisiPoints.filter((point) => point.id !== id),
    }));
  };

  const handleRangeChange = (
    id: string,
    field: "label" | "amount" | "percentage",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      potensiRanges: prev.potensiRanges.map((range) =>
        range.id === id
          ? {
              ...range,
              [field]: field === "percentage" ? parseInt(String(value)) : value,
            }
          : range
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateData(formData);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);
      console.error("Error saving data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader
            size={32}
            className="text-blue-500 animate-spin"
            aria-hidden="true"
          />
          <p className="text-slate-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                aria-label="Kembali ke halaman sebelumnya"
                onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} aria-hidden="true" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Edit Komisi Magang
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Kelola konten bagian komisi dan penghasilan
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {savedMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-green-300 font-medium">
              ✅ Perubahan berhasil disimpan!
            </p>
          </div>
        )}

        {/* Error Message */}
        {(error || contextError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex gap-3">
            <AlertCircle
              size={20}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-red-300 font-semibold">Error:</p>
              <p className="text-red-200 text-sm">{error || contextError}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Komisi Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {formData.komisiTitle}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {formData.komisiSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="komisiTitle"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Judul Bagian
                </label>
                <input
                  id="komisiTitle"
                  type="text"
                  name="komisiTitle"
                  value={formData.komisiTitle}
                  onChange={handleInputChange}
                  placeholder="Judul komisi"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label
                  htmlFor="komisiSubtitle"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Subtitle
                </label>
                <input
                  id="komisiSubtitle"
                  type="text"
                  name="komisiSubtitle"
                  value={formData.komisiSubtitle}
                  onChange={handleInputChange}
                  placeholder="Subtitle komisi"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Points */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="block text-sm font-semibold text-slate-300">
                    Poin-Poin Komisi
                  </span>
                  <button
                    onClick={handleAddPoint}
                    aria-label="Tambah poin baru"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus size={16} />
                    Tambah
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.komisiPoints.map((point, index) => (
                    <div key={point.id} className="flex gap-2">
                      <input
                        type="text"
                        value={point.text}
                        onChange={(e) =>
                          handlePointChange(point.id, e.target.value)
                        }
                        placeholder={`Poin ${index + 1}`}
                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                      />
                      <button
                        onClick={() => handleRemovePoint(point.id)}
                        aria-label={`Hapus poin ${index + 1}`}
                        className="p-2.5 bg-slate-700 hover:bg-red-600/20 border border-slate-600 hover:border-red-500/50 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-4">Preview</p>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">
                      {formData.komisiTitle}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {formData.komisiSubtitle}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {formData.komisiPoints.map((point) => (
                    <li
                      key={point.id}
                      className="flex gap-2 text-slate-300 text-sm"
                    >
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{point.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Potensi Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {formData.potensiTitle}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {formData.potensiSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="potensiTitle"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Judul Bagian
                </label>
                <input
                  id="potensiTitle"
                  type="text"
                  name="potensiTitle"
                  value={formData.potensiTitle}
                  onChange={handleInputChange}
                  placeholder="Judul potensi penghasilan"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label
                  htmlFor="potensiSubtitle"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Subtitle
                </label>
                <input
                  id="potensiSubtitle"
                  type="text"
                  name="potensiSubtitle"
                  value={formData.potensiSubtitle}
                  onChange={handleInputChange}
                  placeholder="Subtitle potensi penghasilan"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              {/* Ranges */}
              <div>
                <span className="block text-sm font-semibold text-slate-300 mb-3">
                  Rentang Penghasilan
                </span>
                <div className="space-y-4">
                  {formData.potensiRanges.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 space-y-3"
                    >
                      <div>
                        <label
                          htmlFor={`range-label-${item.id}`}
                          className="block text-xs text-slate-400 mb-1"
                        >
                          Label Rentang {index + 1}
                        </label>
                        <input
                          id={`range-label-${item.id}`}
                          type="text"
                          value={item.label}
                          onChange={(e) =>
                            handleRangeChange(item.id, "label", e.target.value)
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                          placeholder="Contoh: Pemula (1-5 bulan/bulan)"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`range-amount-${item.id}`}
                          className="block text-xs text-slate-400 mb-1"
                        >
                          Jumlah Penghasilan {index + 1}
                        </label>
                        <input
                          id={`range-amount-${item.id}`}
                          type="text"
                          value={item.amount}
                          onChange={(e) =>
                            handleRangeChange(item.id, "amount", e.target.value)
                          }
                          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                          placeholder="Contoh: Rp 500rb - 1jt"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`range-percentage-${item.id}`}
                          className="block text-xs text-slate-400 mb-1"
                        >
                          Progress Bar (%) — Rentang {index + 1}
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            id={`range-percentage-${item.id}`}
                            type="range"
                            min="0"
                            max="100"
                            value={item.percentage}
                            onChange={(e) =>
                              handleRangeChange(
                                item.id,
                                "percentage",
                                e.target.value
                              )
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={item.percentage}
                            aria-label={`Persentase untuk ${item.label}`}
                            className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <span className="text-white text-sm font-semibold w-12 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-xs text-slate-400 mb-4">Preview</p>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">
                      {formData.potensiTitle}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {formData.potensiSubtitle}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {formData.potensiRanges.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-300 text-sm font-medium line-clamp-1">
                          {item.label}
                        </p>
                        <span className="text-amber-400 font-bold text-sm">
                          {item.amount}
                        </span>
                      </div>
                      <div
                        className="w-full bg-slate-700 rounded-full h-2"
                        role="progressbar"
                        aria-valuenow={item.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Progress ${item.label}`}
                      >
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle
            size={20}
            className="text-blue-400 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Tips:</p>
            <p>
              Pastikan semua konten akurat dan menarik. Progress bar menunjukkan
              potensi penghasilan yang bisa dicapai. Simpan perubahan agar
              terupdate di landing page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
