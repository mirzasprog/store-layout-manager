import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Store } from '@/hooks/useStores';
import { toast } from 'sonner';

export interface StoreLeaseTotal {
  storeId: string;
  storeName: string;
  leasedValue: number;
  leasedCount: number;
}

export interface PositionLabelTotal {
  label: string;
  leasedValue: number;
  leasedCount: number;
}

export function useLeaseTotals(stores: Store[]) {
  const [loading, setLoading] = useState(false);
  const [storeTotals, setStoreTotals] = useState<StoreLeaseTotal[]>([]);
  const [labelTotals, setLabelTotals] = useState<PositionLabelTotal[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const fetchTotals = useCallback(async () => {
    if (stores.length === 0) {
      setStoreTotals([]);
      setLabelTotals([]);
      setTotalValue(0);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('lease_value_km, position_label, store_id, is_free');

      if (error) throw error;

      const storeMap = new Map(stores.map(store => [store.id, store.name]));
      const storeAccumulator = new Map<string, { leasedValue: number; leasedCount: number }>();
      const labelAccumulator = new Map<string, { leasedValue: number; leasedCount: number }>();

      stores.forEach(store => {
        storeAccumulator.set(store.id, { leasedValue: 0, leasedCount: 0 });
      });

      let total = 0;

      (data || []).forEach((row: any) => {
        if (row.is_free) return;
        const leaseValue = Number(row.lease_value_km ?? 0);
        total += leaseValue;

        const storeEntry = storeAccumulator.get(row.store_id) || { leasedValue: 0, leasedCount: 0 };
        storeEntry.leasedValue += leaseValue;
        storeEntry.leasedCount += 1;
        storeAccumulator.set(row.store_id, storeEntry);

        const label = row.position_label?.trim() || 'Bez naziva';
        const labelEntry = labelAccumulator.get(label) || { leasedValue: 0, leasedCount: 0 };
        labelEntry.leasedValue += leaseValue;
        labelEntry.leasedCount += 1;
        labelAccumulator.set(label, labelEntry);
      });

      const nextStoreTotals: StoreLeaseTotal[] = stores.map(store => {
        const totals = storeAccumulator.get(store.id) || { leasedValue: 0, leasedCount: 0 };
        return {
          storeId: store.id,
          storeName: store.name,
          leasedValue: totals.leasedValue,
          leasedCount: totals.leasedCount,
        };
      });

      const nextLabelTotals: PositionLabelTotal[] = Array.from(labelAccumulator.entries())
        .map(([label, totals]) => ({
          label,
          leasedValue: totals.leasedValue,
          leasedCount: totals.leasedCount,
        }))
        .sort((a, b) => b.leasedValue - a.leasedValue);

      setStoreTotals(nextStoreTotals);
      setLabelTotals(nextLabelTotals);
      setTotalValue(total);
    } catch (error) {
      console.error('Error fetching lease totals:', error);
      toast.error('Greška pri učitavanju izvještaja o zakupu');
    } finally {
      setLoading(false);
    }
  }, [stores]);

  useEffect(() => {
    fetchTotals();
  }, [fetchTotals]);

  return {
    loading,
    storeTotals,
    labelTotals,
    totalValue,
    refetch: fetchTotals,
  };
}
