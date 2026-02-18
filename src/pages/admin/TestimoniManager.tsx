import { useState } from "react";
import { useTestimoni, Testimoni } from "@/context/TestimoniContext";
import { Trash2, Edit2, Plus, X, AlertCircle, Check } from "lucide-react";

interface FormData {
  author: string;
  program: string;
  content: string;
  rating: number;
  status: "published" | "draft" | "pending";
  date: string;
  image?: string;
  earnings?: string;
}

export default function TestimoniManager() {
  const { testimoni, updateTestimoni, deleteTestimoni, addTestimoni, error } =
    useTestimoni();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    author: "",
    program: "",
    content: "",
    rating: 5,
    status: "published",
    date: new Date().toISOString().split("T")[0],
    image: "",
    earnings: "",
  });

  // Handle Edit - Load data ke form
  const handleEdit = (id: string) => {
    const item = testimoni.find((t) => t.id === id);
    if (item) {
      setFormData({
        author: item.author,
        program: item.program || "",
        content: item.content,
        rating: item.rating,
        status: item.status,
        date: item.date,
        image: item.image,
        earnings: item.earnings,
      });
      setEditingId(id);
      setShowForm(true);
      setFormError("");
      setSuccessMessage("");
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validation
    if (!formData.author.trim() || !formData.content.trim()) {
      setFormError("❌ Author dan Content tidak boleh kosong!");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        // UPDATE
        await updateTestimoni(editingId, {
          author: formData.author,
          program: formData.program,
          content: formData.content,
          rating: formData.rating,
          status: formData.status,
          date: formData.date,
          image: formData.image,
          earnings: formData.earnings,
        });
        setSuccessMessage("✅ Testimoni berhasil diupdate!");
      } else {
        // ADD NEW
        const newTestimoni: Testimoni = {
          id: Date.now().toString(),
          author: formData.author,
          program: formData.program,
          content: formData.content,
          rating: formData.rating,
          status: formData.status,
          date: formData.date,
          image: formData.image,
          earnings: formData.earnings,
          // Auto-generate avatar
          avatar: formData.author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        };
        await addTestimoni(newTestimoni);
        setSuccessMessage("✅ Testimoni berhasil ditambahkan!");
      }

      // Auto-close setelah 1.5 detik
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (err) {
      console.error("Error saving testimoni:", err);
      setFormError(
        `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      author: "",
      program: "",
      content: "",
      rating: 5,
      status: "published",
      date: new Date().toISOString().split("T")[0],
      image: "",
      earnings: "",
    });
    setEditingId(null);
    setShowForm(false);
    setFormError("");
    setSuccessMessage("");
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (confirm("🗑️ Apakah Anda yakin ingin menghapus testimoni ini?")) {
      try {
        await deleteTestimoni(id);
        alert("✅ Testimoni berhasil dihapus!");
      } catch (err) {
        console.error("Error deleting testimoni:", err);
        alert(
          `❌ Error: ${err instanceof Error ? err.message : "Failed to delete"}`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert - Supabase */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex gap-3">
          <AlertCircle
            size={20}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-red-300 font-semibold">Supabase Error:</p>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Testimoni Manager</h2>
          <p className="text-slate-400 mt-1">Manage student testimonials</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          Add Testimoni
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {editingId ? "Edit Testimoni" : "Add New Testimoni"}
            </h3>
            <button
              onClick={resetForm}
              disabled={isSubmitting}
              aria-label="Close form"
              title="Close"
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex gap-3">
              <AlertCircle
                size={18}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-300 text-sm">{formError}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 mb-4 flex gap-3">
              <Check
                size={18}
                className="text-green-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Author / Nama *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Nama lengkap"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Program
                </label>
                <input
                  type="text"
                  value={formData.program}
                  onChange={(e) =>
                    setFormData({ ...formData, program: e.target.value })
                  }
                  placeholder="Sales & Marketing"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rating (1-5)
                </label>
                <select
                  title="Rating" // ⭐ ini penting
                  aria-label="Rating"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r} {"⭐".repeat(r)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  title="Status Testimoni"
                  aria-label="Status Testimoni"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "published"
                        | "draft"
                        | "pending",
                    })
                  }
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="published">📢 Published</option>
                  <option value="draft">✏️ Draft</option>
                  <option value="pending">⏳ Pending</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Date
                </label>

                <input
                  id="date"
                  type="date"
                  aria-label="Select date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Image URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://i.pravatar.cc/150?img=1"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50"
                />
              </div>

              {/* Earnings (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Earnings (Optional)
                </label>
                <input
                  type="text"
                  value={formData.earnings}
                  onChange={(e) =>
                    setFormData({ ...formData, earnings: e.target.value })
                  }
                  placeholder="Rp 2.500.000"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content / Testimoni *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Testimoni content..."
                rows={4}
                disabled={isSubmitting}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : editingId ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700 hover:border-blue-500 transition-colors">
          <input
            type="text"
            aria-label="Search testimoni by author"
            placeholder="Search by author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-slate-300 placeholder-slate-500 w-full"
          />
        </div>
        <button className="px-6 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors">
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {testimoni
                .filter((item) =>
                  item.author?.toLowerCase().includes(search.toLowerCase())
                )
                .map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-semibold flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                          {item.avatar}
                        </div>
                      )}
                      {item.author}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.program}</td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate text-sm">
                      {item.content}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400">
                        {"⭐".repeat(item.rating)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                          item.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : item.status === "draft"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {item.status === "published"
                          ? "Published"
                          : item.status === "draft"
                          ? "Draft"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-blue-600/20 rounded-lg text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-red-600/20 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {testimoni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">📭 No testimoni yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
