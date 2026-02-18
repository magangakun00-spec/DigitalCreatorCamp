import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@supabase/supabase-js";

export interface Testimoni {
  id: string;
  author: string;
  program: string;
  content: string;
  rating: number;
  status: "published" | "draft" | "pending";
  date: string;
  image?: string;
  avatar?: string;
  earnings?: string;
}

interface TestimoniContextType {
  testimoni: Testimoni[];
  addTestimoni: (item: Testimoni) => Promise<void>;
  updateTestimoni: (id: string, item: Partial<Testimoni>) => Promise<void>;
  deleteTestimoni: (id: string) => Promise<void>;
  getPublishedTestimoni: () => Testimoni[];
  refetchTestimoni: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TestimoniContext = createContext<TestimoniContextType | undefined>(
  undefined
);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

console.log("🔍 Supabase Config Check:");
console.log("URL:", SUPABASE_URL ? "✅ Set" : "❌ Not set");
console.log("Key:", SUPABASE_ANON_KEY ? "✅ Set" : "❌ Not set");

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client initialized");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase:", err);
  }
} else {
  console.warn("⚠️ Supabase credentials not found. Using localStorage only.");
}

const STORAGE_KEY = "testimoni_data";
const TABLE_NAME = "testimoni";

export const TestimoniProvider = ({ children }: { children: ReactNode }) => {
  const [testimoni, setTestimoni] = useState<Testimoni[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load testimoni from Supabase
  const loadTestimoni = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!supabase) {
        console.warn(
          "⚠️ Supabase tidak dikonfigurasi. Menggunakan localStorage."
        );
        loadFromLocalStorage();
        return;
      }

      console.log("📡 Fetching testimoni from Supabase...");

      // Fetch dari Supabase
      const { data, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("date", { ascending: false });

      if (fetchError) {
        console.error("❌ Error fetching dari Supabase:", fetchError);
        setError(fetchError.message);
        loadFromLocalStorage();
        return;
      }

      if (data && data.length > 0) {
        // ✅ Convert id to string for consistency
        const mappedData = data.map((item: any) => ({
          id: item.id.toString(), // Convert integer to string
          author: item.author || "",
          program: item.program || "",
          content: item.content || "",
          rating: item.rating || 5,
          status: item.status || "draft",
          date: item.date || item.created_at || "",
          image: item.image,
          avatar: item.avatar,
          earnings: item.earnings,
        }));

        setTestimoni(mappedData);
        console.log("✅ Loaded testimoni from Supabase:", mappedData.length);

        // Sync ke localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
      } else {
        console.log("📭 No testimoni in database yet");
        setTestimoni([]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } catch (err) {
      console.error("❌ Error loading testimoni:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        setTestimoni(data);
        console.log("✅ Loaded testimoni from localStorage:", data.length);
      } else {
        setTestimoni([]);
        console.log("📭 No testimoni in localStorage");
      }
    } catch (err) {
      console.error("❌ Error loading from localStorage:", err);
      setTestimoni([]);
    }
  };

  // Load data saat mount
  useEffect(() => {
    loadTestimoni();
  }, [loadTestimoni]);

  // ✅ ADD TESTIMONI - Don't send id, let Supabase auto-generate
  const addTestimoni = async (item: Testimoni) => {
    try {
      setError(null);

      if (!supabase) {
        // Fallback ke localStorage
        const newItem: Testimoni = {
          ...item,
          id: Date.now().toString(),
        };
        setTestimoni((prev) => [...prev, newItem]);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([...testimoni, newItem])
        );
        console.log(
          "✅ Testimoni added to localStorage (Supabase unavailable)"
        );
        return;
      }

      console.log("📤 Inserting testimoni to Supabase...");

      // ✅ FIX: Don't send 'id' - let database auto-generate it
      const dataToInsert = {
        // id is NOT included - auto-generated by Supabase
        author: item.author,
        program: item.program,
        content: item.content,
        rating: item.rating,
        status: item.status,
        date: item.date,
        image: item.image || null,
        avatar: item.avatar || null,
        earnings: item.earnings || null,
      };

      const { data, error: insertError } = await supabase
        .from(TABLE_NAME)
        .insert([dataToInsert])
        .select();

      if (insertError) {
        console.error("❌ Error inserting to Supabase:", insertError);
        setError(insertError.message);
        throw insertError;
      }

      if (data && data.length > 0) {
        console.log("✅ Testimoni added to Supabase:", data[0].author);
        console.log("🆔 Generated ID:", data[0].id);

        // ✅ Refetch all data to sync
        await loadTestimoni();
        console.log("🔄 Data refreshed - landing page updated!");
      }
    } catch (err) {
      console.error("❌ Error adding testimoni:", err);
      setError(err instanceof Error ? err.message : "Failed to add testimoni");
      throw err;
    }
  };

  // ✅ UPDATE TESTIMONI
  const updateTestimoni = async (id: string, updates: Partial<Testimoni>) => {
    try {
      setError(null);

      if (!supabase) {
        const updated = testimoni.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );
        setTestimoni(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log("✅ Testimoni updated in localStorage");
        return;
      }

      console.log("📝 Updating testimoni in Supabase...");

      const dataToUpdate = {
        author: updates.author,
        program: updates.program,
        content: updates.content,
        rating: updates.rating,
        status: updates.status,
        date: updates.date,
        image: updates.image || null,
        avatar: updates.avatar || null,
        earnings: updates.earnings || null,
      };

      // Remove undefined fields
      Object.keys(dataToUpdate).forEach(
        (key) =>
          dataToUpdate[key as keyof typeof dataToUpdate] === undefined &&
          delete dataToUpdate[key as keyof typeof dataToUpdate]
      );

      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update(dataToUpdate)
        .eq("id", parseInt(id)); // ✅ Convert string id to integer

      if (updateError) {
        console.error("❌ Error updating Supabase:", updateError);
        setError(updateError.message);
        throw updateError;
      }

      console.log("✅ Testimoni updated in Supabase:", id);

      // Refetch untuk sinkronisasi
      await loadTestimoni();
      console.log("🔄 Data refreshed after update!");
    } catch (err) {
      console.error("❌ Error updating testimoni:", err);
      setError(err instanceof Error ? err.message : "Failed to update");
      throw err;
    }
  };

  // ✅ DELETE TESTIMONI
  const deleteTestimoni = async (id: string) => {
    try {
      setError(null);

      if (!supabase) {
        const filtered = testimoni.filter((t) => t.id !== id);
        setTestimoni(filtered);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log("✅ Testimoni deleted from localStorage");
        return;
      }

      console.log("🗑️ Deleting testimoni from Supabase...");

      const { error: deleteError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("id", parseInt(id)); // ✅ Convert string id to integer

      if (deleteError) {
        console.error("❌ Error deleting from Supabase:", deleteError);
        setError(deleteError.message);
        throw deleteError;
      }

      console.log("✅ Testimoni deleted from Supabase:", id);

      // Refetch untuk sinkronisasi
      await loadTestimoni();
      console.log("🔄 Data refreshed after delete!");
    } catch (err) {
      console.error("❌ Error deleting testimoni:", err);
      setError(err instanceof Error ? err.message : "Failed to delete");
      throw err;
    }
  };

  const getPublishedTestimoni = () => {
    return testimoni.filter((t) => t.status === "published");
  };

  const refetchTestimoni = async () => {
    await loadTestimoni();
  };

  return (
    <TestimoniContext.Provider
      value={{
        testimoni,
        addTestimoni,
        updateTestimoni,
        deleteTestimoni,
        getPublishedTestimoni,
        refetchTestimoni,
        isLoading,
        error,
      }}
    >
      {children}
    </TestimoniContext.Provider>
  );
};

export const useTestimoni = () => {
  const context = useContext(TestimoniContext);
  if (!context) {
    throw new Error("useTestimoni must be used within TestimoniProvider");
  }
  return context;
};
