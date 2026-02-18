// src/context/KomisiMagangContext.tsx
// FIXED VERSION - Added Supabase Realtime subscription

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@supabase/supabase-js";

// Types
export interface KomisiPoint {
  id: string;
  text: string;
}

export interface PotensiRange {
  id: string;
  label: string;
  amount: string;
  percentage: number;
}

export interface KomisiMagangData {
  id?: string;
  komisiTitle: string;
  komisiSubtitle: string;
  komisiPoints: KomisiPoint[];
  potensiTitle: string;
  potensiSubtitle: string;
  potensiRanges: PotensiRange[];
}

interface KomisiMagangContextType {
  data: KomisiMagangData | null;
  updateData: (newData: KomisiMagangData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const KomisiMagangContext = createContext<KomisiMagangContextType | undefined>(
  undefined
);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ KomisiMagang: Supabase client initialized");
  } catch (err) {
    console.error("❌ KomisiMagang: Failed to initialize Supabase:", err);
  }
}

const TABLE_NAME = "komisi_magang";

// Default data jika database kosong
const defaultData: KomisiMagangData = {
  komisiTitle: "Komisi Per Penutupan",
  komisiSubtitle: "Transparan & Langsung Dibayar",
  komisiPoints: [
    { id: "1", text: "Komisi 10-20% dari setiap transaksi berhasil" },
    { id: "2", text: "Tidak ada batas maksimal penghasilan" },
    { id: "3", text: "Komisi dibayarkan per minggu" },
    { id: "4", text: "Bonus tambahan untuk top performer" },
  ],
  potensiTitle: "Potensi Penghasilan",
  potensiSubtitle: "Semakin Rajin, Semakin Besar",
  potensiRanges: [
    {
      id: "1",
      label: "Pemula (penutupan 1-5 bulan/bulan)",
      amount: "Rp 500rb - 1jt",
      percentage: 40,
    },
    {
      id: "2",
      label: "Menengah (6-15 tutup/bulan)",
      amount: "Rp 1jt - 3jt",
      percentage: 65,
    },
    {
      id: "3",
      label: "Ahli (16+ penutupan/bulan)",
      amount: "Rp 3jt++",
      percentage: 90,
    },
  ],
};

// Helper: map raw Supabase row → KomisiMagangData
const mapRow = (row: any): KomisiMagangData => ({
  id: row.id.toString(),
  komisiTitle: row.komisi_title,
  komisiSubtitle: row.komisi_subtitle,
  komisiPoints: row.komisi_points,
  potensiTitle: row.potensi_title,
  potensiSubtitle: row.potensi_subtitle,
  potensiRanges: row.potensi_ranges,
});

export const KomisiMagangProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<KomisiMagangData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!supabase) {
        console.warn(
          "⚠️ KomisiMagang: Supabase not configured, using default data"
        );
        setData(defaultData);
        return;
      }

      console.log("📡 KomisiMagang: Fetching from Supabase...");

      const { data: fetchedData, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          console.log("📭 No data found, using default");
          setData(defaultData);
        } else {
          console.error("❌ KomisiMagang: Fetch error:", fetchError);
          setError(fetchError.message);
          setData(defaultData);
        }
        return;
      }

      if (fetchedData) {
        const mappedData = mapRow(fetchedData);
        setData(mappedData);
        console.log("✅ KomisiMagang: Data loaded from Supabase", mappedData);
      } else {
        setData(defaultData);
      }
    } catch (err) {
      console.error("❌ KomisiMagang: Error loading:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(defaultData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIX: Subscribe ke Supabase Realtime
  // Setiap kali admin UPDATE/INSERT di tabel komisi_magang,
  // semua halaman (termasuk landing page) otomatis menerima data terbaru
  useEffect(() => {
    loadData();

    if (!supabase) return;

    console.log("🔔 KomisiMagang: Subscribing to Realtime...");

    const channel = supabase
      .channel("komisi_magang_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // listen INSERT, UPDATE, DELETE
          schema: "public",
          table: TABLE_NAME,
        },
        (payload: any) => {
          console.log("🔄 KomisiMagang: Realtime update received", payload);

          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT"
          ) {
            const updated = mapRow(payload.new);
            setData(updated);
            console.log("✅ KomisiMagang: State updated via Realtime", updated);
          }

          if (payload.eventType === "DELETE") {
            setData(defaultData);
          }
        }
      )
      .subscribe((status: string) => {
        console.log("📡 KomisiMagang: Realtime status:", status);
      });

    // Cleanup subscription saat unmount
    return () => {
      console.log("🔕 KomisiMagang: Unsubscribing from Realtime");
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Update data ke Supabase
  const updateData = async (newData: KomisiMagangData) => {
    try {
      setError(null);

      if (!supabase) {
        setData(newData);
        console.warn(
          "⚠️ KomisiMagang: Supabase not configured, data only in memory"
        );
        return;
      }

      console.log("📤 KomisiMagang: Updating Supabase...");

      const dataToUpdate = {
        komisi_title: newData.komisiTitle,
        komisi_subtitle: newData.komisiSubtitle,
        komisi_points: newData.komisiPoints,
        potensi_title: newData.potensiTitle,
        potensi_subtitle: newData.potensiSubtitle,
        potensi_ranges: newData.potensiRanges,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from(TABLE_NAME)
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from(TABLE_NAME)
          .update(dataToUpdate)
          .eq("id", existing.id);

        if (updateError) {
          console.error("❌ KomisiMagang: Update error:", updateError);
          throw updateError;
        }
        console.log("✅ KomisiMagang: Updated successfully");
      } else {
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert([dataToUpdate]);

        if (insertError) {
          console.error("❌ KomisiMagang: Insert error:", insertError);
          throw insertError;
        }
        console.log("✅ KomisiMagang: Inserted successfully");
      }

      // Update state lokal langsung (Realtime juga akan trigger, tapi ini lebih cepat)
      setData({ ...newData });
    } catch (err) {
      console.error("❌ KomisiMagang: Error updating:", err);
      setError(err instanceof Error ? err.message : "Failed to update");
      throw err;
    }
  };

  const refetch = async () => {
    await loadData();
  };

  return (
    <KomisiMagangContext.Provider
      value={{
        data,
        updateData,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </KomisiMagangContext.Provider>
  );
};

export const useKomisiMagang = () => {
  const context = useContext(KomisiMagangContext);
  if (!context) {
    throw new Error("useKomisiMagang must be used within KomisiMagangProvider");
  }
  return context;
};
