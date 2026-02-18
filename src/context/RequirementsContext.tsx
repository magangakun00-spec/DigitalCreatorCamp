// src/context/RequirementsContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@supabase/supabase-js";

export interface Requirement {
  id: string;
  text: string;
  order: number;
}

interface RequirementsContextType {
  requirements: Requirement[];
  saveRequirements: (items: Requirement[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch {}
}

const TABLE_NAME = "requirements";

const defaultRequirements: Requirement[] = [
  { id: "1", text: "Tidak perlu pengalaman sebelumnya", order: 1 },
  { id: "2", text: "Punya laptop/HP dan internet", order: 2 },
  { id: "3", text: "Bisa komitmen minimal 3 bulan", order: 3 },
  { id: "4", text: "Niat belajar & konsisten", order: 4 },
  { id: "5", text: "Siap praktik dan target-oriented", order: 5 },
];

const RequirementsContext = createContext<RequirementsContextType | undefined>(
  undefined
);

export const RequirementsProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] =
    useState<Requirement[]>(defaultRequirements);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!supabase) {
        setRequirements(defaultRequirements);
        return;
      }

      // ✅ Pakai mayfail, tidak pakai .single() agar tidak 406 kalau kosong
      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Requirements fetch error:", fetchError);
        setRequirements(defaultRequirements);
        return;
      }

      if (data?.items?.length > 0) {
        setRequirements(data.items);
        console.log("✅ Requirements loaded from Supabase");
      } else {
        // Tabel kosong — pakai default
        setRequirements(defaultRequirements);
        console.log("📭 Requirements empty, using default");
      }
    } catch (err) {
      setRequirements(defaultRequirements);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    if (!supabase) return;

    const channel = supabase
      .channel("requirements_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE_NAME },
        (payload: any) => {
          if (
            (payload.eventType === "UPDATE" ||
              payload.eventType === "INSERT") &&
            payload.new?.items
          ) {
            setRequirements(payload.new.items);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const saveRequirements = async (items: Requirement[]) => {
    if (!supabase) {
      setRequirements(items);
      return;
    }

    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = { items, updated_at: new Date().toISOString() };

    if (existing) {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from(TABLE_NAME).insert([payload]);
      if (error) throw error;
    }

    setRequirements(items);
    console.log("✅ Requirements saved to Supabase");
  };

  return (
    <RequirementsContext.Provider
      value={{ requirements, saveRequirements, isLoading, error }}
    >
      {children}
    </RequirementsContext.Provider>
  );
};

export const useRequirements = () => {
  const ctx = useContext(RequirementsContext);
  if (!ctx)
    throw new Error("useRequirements must be used within RequirementsProvider");
  return ctx;
};
