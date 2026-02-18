"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface ContactInfo {
  phone_display: string;
  email: string;
  instagram: string;
  instagram_url: string;
  whatsapp_url: string;
}

interface ContactContextType {
  contact: ContactInfo;
  updateContact: (data: ContactInfo) => Promise<{ error: string | null }>;
  loading: boolean;
}

// ──────────────────────────────────────────────
// Default values (fallback jika Supabase belum ada data)
// ──────────────────────────────────────────────
const defaultContact: ContactInfo = {
  phone_display: "+62 812-3456-7890",
  email: "info@digimagang.id",
  instagram: "@digimagang.id",
  instagram_url: "https://instagram.com/digimagang.id",
  whatsapp_url: "https://wa.me/6281234567890",
};

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [loading, setLoading] = useState(true);

  // Fetch dari Supabase saat pertama kali load
  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        setContact({
          phone_display: data.phone_display,
          email: data.email,
          instagram: data.instagram,
          instagram_url: data.instagram_url,
          whatsapp_url: data.whatsapp_url,
        });
      }
      setLoading(false);
    };

    fetchContact();
  }, []);

  // Update ke Supabase
  const updateContact = async (
    data: ContactInfo
  ): Promise<{ error: string | null }> => {
    // Auto-build whatsappUrl dari nomor phone
    const phoneNumber = data.phone_display.replace(/[^0-9]/g, "");
    const updated = { ...data, whatsapp_url: `https://wa.me/${phoneNumber}` };

    const { error } = await supabase
      .from("contact_info")
      .update({
        phone_display: updated.phone_display,
        email: updated.email,
        instagram: updated.instagram,
        instagram_url: updated.instagram_url,
        whatsapp_url: updated.whatsapp_url,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // update semua row

    if (error) {
      return { error: error.message };
    }

    setContact(updated);
    return { error: null };
  };

  return (
    <ContactContext.Provider value={{ contact, updateContact, loading }}>
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used within ContactProvider");
  return ctx;
}
