import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  LogIn,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi");
      return;
    }

    if (!isSupabaseConfigured) {
      setError("Supabase belum dikonfigurasi. Isi file .env terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password: password,
        }
      );

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          setError("Email atau password salah. Silakan coba lagi.");
        } else if (authError.message === "Email not confirmed") {
          setError("Email belum dikonfirmasi. Cek inbox email Anda.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!data.user) {
        setError("Login gagal. Silakan coba lagi.");
        return;
      }

      // Cek apakah user terdaftar di tabel admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id, role")
        .eq("user_id", data.user.id)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        setError("Akun ini tidak memiliki akses ke Admin Panel.");
        return;
      }

      navigate("/admin");
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/40 relative">
                <span className="text-white font-bold text-2xl">D</span>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-slate-900 flex items-center justify-center">
                  <ShieldCheck size={9} className="text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Digital Creator Camp
            </h1>
            <p className="text-slate-400 text-sm">
              Admin Panel · Secured by Supabase
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ⚠️ Supabase Not Configured Warning */}
            {!isSupabaseConfigured && (
              <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-4 flex gap-3">
                <AlertCircle
                  size={18}
                  className="text-yellow-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-yellow-300 text-sm font-semibold mb-1">
                    ⚙️ Supabase belum dikonfigurasi
                  </p>
                  <p className="text-yellow-200/60 text-xs leading-relaxed">
                    Buat file{" "}
                    <span className="bg-yellow-500/20 px-1 rounded font-mono">
                      .env
                    </span>{" "}
                    di root project, isi:
                  </p>
                  <div className="mt-2 bg-slate-800/60 rounded-lg p-2 text-xs font-mono text-yellow-200/80 space-y-0.5">
                    <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
                    <p>VITE_SUPABASE_ANON_KEY=eyJ...</p>
                  </div>
                  <p className="text-yellow-200/50 text-xs mt-2">
                    Lalu restart:{" "}
                    <span className="font-mono bg-yellow-500/20 px-1 rounded">
                      npm run dev
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex gap-3">
                <AlertCircle
                  size={18}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-800/50 disabled:to-blue-700/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <p className="text-center text-slate-600 text-xs mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} />
            Akses dibatasi hanya untuk admin terdaftar
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-4">
          © 2024 Digital Creator Camp. All rights reserved.
        </p>
      </div>
    </div>
  );
}
