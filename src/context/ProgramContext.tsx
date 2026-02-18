// src/context/ProgramContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@supabase/supabase-js";

export interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "draft";
  participants: number;
  startDate: string;
  endDate: string;
  price?: string;
  duration?: string;
  icon?: string;
}

interface ProgramContextType {
  programs: Program[];
  addProgram: (program: Omit<Program, "id">) => Promise<void>;
  updateProgram: (id: string, data: Partial<Program>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  getActivePrograms: () => Program[];
  isLoading: boolean;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error("❌ Program: Failed to initialize Supabase:", err);
  }
}

const TABLE_NAME = "programs";

const mapRow = (row: any): Program => ({
  id: row.id.toString(),
  name: row.name,
  description: row.description,
  category: row.category,
  status: row.status,
  participants: row.participants ?? 0,
  startDate: row.start_date,
  endDate: row.end_date,
  price: row.price ?? "Gratis",
  duration: row.duration ?? "3 Bulan",
  icon: row.icon ?? "📚",
});

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!supabase) {
        setPrograms([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("❌ Program: Fetch error:", fetchError);
        setError(fetchError.message);
        return;
      }

      setPrograms((data || []).map(mapRow));
      console.log(`✅ Program: Loaded ${data?.length} programs`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();

    if (!supabase) return;

    const channel = supabase
      .channel("programs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE_NAME },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setPrograms((prev) => [mapRow(payload.new), ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setPrograms((prev) =>
              prev.map((p) =>
                p.id === payload.new.id.toString() ? mapRow(payload.new) : p
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setPrograms((prev) =>
              prev.filter((p) => p.id !== payload.old.id.toString())
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPrograms]);

  const addProgram = async (data: Omit<Program, "id">) => {
    if (!supabase) return;
    const { error } = await supabase.from(TABLE_NAME).insert([
      {
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status,
        participants: data.participants,
        start_date: data.startDate,
        end_date: data.endDate,
        price: data.price,
        duration: data.duration,
        icon: data.icon,
      },
    ]);
    if (error) throw error;
  };

  const updateProgram = async (id: string, data: Partial<Program>) => {
    if (!supabase) return;
    const payload: any = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.status !== undefined) payload.status = data.status;
    if (data.participants !== undefined)
      payload.participants = data.participants;
    if (data.startDate !== undefined) payload.start_date = data.startDate;
    if (data.endDate !== undefined) payload.end_date = data.endDate;
    if (data.price !== undefined) payload.price = data.price;
    if (data.duration !== undefined) payload.duration = data.duration;
    if (data.icon !== undefined) payload.icon = data.icon;

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq("id", id);
    if (error) throw error;
  };

  const deleteProgram = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
    if (error) throw error;
  };

  const getActivePrograms = () => programs.filter((p) => p.status === "active");

  return (
    <ProgramContext.Provider
      value={{
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        getActivePrograms,
        isLoading,
        error,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

export function useProgram() {
  const context = useContext(ProgramContext);
  if (!context)
    throw new Error("useProgram harus digunakan di dalam ProgramProvider");
  return context;
}
