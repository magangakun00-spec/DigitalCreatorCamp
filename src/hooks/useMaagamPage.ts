// hooks/useMaagamPage.ts

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MaagamPageData, MaagamPageFormData } from '@/types/magang';

export const useMaagamPage = () => {
  const [data, setData] = useState<MaagamPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: pageData, error: fetchError } = await supabase
        .from('magang_page')
        .select('*')
        .single();

      if (fetchError) throw fetchError;
      setData(pageData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching magang page:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update data
  const updateData = async (updates: Partial<MaagamPageFormData>) => {
    try {
      if (!data?.id) throw new Error('No data to update');

      const { data: updatedData, error: updateError } = await supabase
        .from('magang_page')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setData(updatedData);
      return updatedData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update data';
      setError(errorMsg);
      console.error('Error updating magang page:', err);
      throw err;
    }
  };

  // Publish data
  const publishData = async (published: boolean) => {
    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('magang_page')
        .update({
          is_published: published,
          published_at: published ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data?.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setData(updatedData);
      return updatedData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to publish data';
      setError(errorMsg);
      console.error('Error publishing magang page:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    updateData,
    publishData,
    refetch: fetchData,
  };
};