import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Store {
  id: string;
  name: string;
  floor_plan_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      setStores(data || []);
      
      if (data && data.length > 0 && !currentStore) {
        setCurrentStore(data[0]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Greška pri učitavanju prodavnica');
    } finally {
      setLoading(false);
    }
  }, [currentStore]);

  const addStore = useCallback(async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      
      setStores(prev => [...prev, data]);
      toast.success('Nova prodavnica dodana!');
      return data;
    } catch (error) {
      console.error('Error adding store:', error);
      toast.error('Greška pri dodavanju prodavnice');
      return null;
    }
  }, []);

  const updateStore = useCallback(async (id: string, updates: Partial<Pick<Store, 'name' | 'floor_plan_url'>>) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStores(prev => prev.map(s => s.id === id ? data : s));
      if (currentStore?.id === id) {
        setCurrentStore(data);
      }
      return data;
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Greška pri ažuriranju prodavnice');
      return null;
    }
  }, [currentStore]);

  const deleteStore = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStores(prev => prev.filter(s => s.id !== id));
      if (currentStore?.id === id) {
        setCurrentStore(stores.find(s => s.id !== id) || null);
      }
      toast.success('Prodavnica obrisana!');
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Greška pri brisanju prodavnice');
    }
  }, [currentStore, stores]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    currentStore,
    setCurrentStore,
    loading,
    addStore,
    updateStore,
    deleteStore,
    refetch: fetchStores,
  };
}
