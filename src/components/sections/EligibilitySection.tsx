// src/components/sections/EligibilitySection.tsx

import { CheckCircle2, Heart } from "lucide-react";
import { useProgram } from "@/context/ProgramContext";
import { useRequirements } from "@/context/RequirementsContext";

const EligibilitySection = () => {
  const { getActivePrograms, isLoading: loadingPrograms } = useProgram();
  const { requirements, isLoading: loadingReq } = useRequirements();
  const activePrograms = getActivePrograms();

  if (loadingPrograms || loadingReq) {
    return (
      <section className="py-20 md:py-28 bg-muted">
        <div className="container flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Memuat...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Siapa yang Bisa Daftar?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Program Ini{" "}
            <span className="text-gradient-hero">Cocok untuk Kamu!</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Kartu program aktif dari Supabase */}
          <div className="grid sm:grid-cols-2 gap-4">
            {activePrograms.length > 0 ? (
              activePrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-2xl">
                    {program.icon || "📚"}
                  </div>
                  <h3 className="font-bold text-foreground mb-1">
                    {program.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {program.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                Belum ada program aktif.
              </div>
            )}
          </div>

          {/* Syarat Pendaftaran dari Supabase */}
          <div className="bg-card p-8 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-xl">
                  Syarat Pendaftaran
                </h3>
                <p className="text-muted-foreground text-sm">
                  Mudah & Terbuka untuk Semua
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EligibilitySection;
