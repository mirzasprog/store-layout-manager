import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Position, Department } from '@/types/position';
import { toast } from 'sonner';

export interface PositionFilters {
  department: Department | 'all';
  status: 'all' | 'occupied' | 'free' | 'expiring';
  search: string;
}

const mapDbToPosition = (row: any): Position => ({
  id: row.id,
  positionNumber: row.position_number,
  trader: row.trader,
  leaseEndDate: row.lease_end_date,
  leaseValueKm: row.lease_value_km ?? 0,
  positionLabel: row.position_label ?? '',
  positionType: row.position_type ?? '',
  itemName: row.item_name ?? '',
  department: row.department as Department,
  isFree: row.is_free,
  x: row.x,
  y: row.y,
  width: row.width ?? 60,
  height: row.height ?? 60,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function usePositions(storeId: string | null) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PositionFilters>({
    department: 'all',
    status: 'all',
    search: '',
  });

  const fetchPositions = useCallback(async () => {
    if (!storeId) {
      setPositions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('store_id', storeId)
        .order('position_number');

      if (error) throw error;
      setPositions((data || []).map(mapDbToPosition));
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Greška pri učitavanju pozicija');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchPositions();
    setSelectedPosition(null);
  }, [fetchPositions]);

  // Realtime subscription for positions
  useEffect(() => {
    if (!storeId) return;

    const channel = supabase
      .channel(`positions-realtime-${storeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `store_id=eq.${storeId}` },
        (payload) => {
          console.log('Position realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            const newPos = mapDbToPosition(payload.new);
            setPositions(prev => {
              if (prev.find(p => p.id === newPos.id)) return prev;
              return [...prev, newPos];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbToPosition(payload.new);
            setPositions(prev => prev.map(p => p.id === updated.id ? updated : p));
            if (selectedPosition?.id === updated.id) {
              setSelectedPosition(updated);
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setPositions(prev => prev.filter(p => p.id !== deletedId));
            if (selectedPosition?.id === deletedId) {
              setSelectedPosition(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storeId, selectedPosition]);

  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      // Department filter
      if (filters.department !== 'all' && p.department !== filters.department) {
        return false;
      }
      
      // Status filter
      if (filters.status === 'occupied' && p.isFree) return false;
      if (filters.status === 'free' && !p.isFree) return false;
      if (filters.status === 'expiring') {
        if (!p.leaseEndDate) return false;
        const endDate = new Date(p.leaseEndDate);
        const now = new Date();
        const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 30 || diffDays <= 0) return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesNumber = p.positionNumber.toLowerCase().includes(searchLower);
        const matchesTrader = p.trader.toLowerCase().includes(searchLower);
        const matchesLabel = p.positionLabel.toLowerCase().includes(searchLower);
        const matchesType = p.positionType.toLowerCase().includes(searchLower);
        const matchesItem = p.itemName.toLowerCase().includes(searchLower);
        if (!matchesNumber && !matchesTrader && !matchesLabel && !matchesType && !matchesItem) return false;
      }
      
      return true;
    });
  }, [positions, filters]);

  const addPosition = useCallback(async (x: number, y: number) => {
    if (!storeId) return null;

    const positionNumber = `P${String(positions.length + 1).padStart(3, '0')}`;
    
    try {
      const { data, error } = await supabase
        .from('positions')
        .insert({
          store_id: storeId,
          position_number: positionNumber,
          trader: '',
          lease_value_km: 0,
          position_label: '',
          position_type: '',
          item_name: '',
          department: 'slobodna',
          is_free: true,
          x,
          y,
          width: 60,
          height: 60,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newPosition = mapDbToPosition(data);
      setPositions(prev => [...prev, newPosition]);
      setSelectedPosition(newPosition);
      return newPosition;
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Greška pri dodavanju pozicije');
      return null;
    }
  }, [storeId, positions.length]);

  const updatePosition = useCallback(async (id: string, updates: Partial<Position>) => {
    try {
      const dbUpdates: any = {};
      if (updates.positionNumber !== undefined) dbUpdates.position_number = updates.positionNumber;
      if (updates.trader !== undefined) {
        dbUpdates.trader = updates.trader;
        const hasTrader = updates.trader && updates.trader.trim() !== '';
        dbUpdates.is_free = !hasTrader;
        if (!hasTrader) {
          dbUpdates.department = 'slobodna';
        } else if (updates.department === 'slobodna' || (!updates.department && positions.find(p => p.id === id)?.department === 'slobodna')) {
          dbUpdates.department = 'svjeza';
        }
      }
      if (updates.leaseEndDate !== undefined) dbUpdates.lease_end_date = updates.leaseEndDate;
      if (updates.leaseValueKm !== undefined) dbUpdates.lease_value_km = updates.leaseValueKm;
      if (updates.positionLabel !== undefined) dbUpdates.position_label = updates.positionLabel;
      if (updates.positionType !== undefined) dbUpdates.position_type = updates.positionType;
      if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.isFree !== undefined) dbUpdates.is_free = updates.isFree;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.x !== undefined) dbUpdates.x = updates.x;
      if (updates.y !== undefined) dbUpdates.y = updates.y;
      if (updates.width !== undefined) dbUpdates.width = updates.width;
      if (updates.height !== undefined) dbUpdates.height = updates.height;

      const { data, error } = await supabase
        .from('positions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedPosition = mapDbToPosition(data);
      setPositions(prev => prev.map(p => p.id === id ? updatedPosition : p));
      if (selectedPosition?.id === id) {
        setSelectedPosition(updatedPosition);
      }
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error('Greška pri ažuriranju pozicije');
    }
  }, [positions, selectedPosition]);

  const deletePosition = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPositions(prev => prev.filter(p => p.id !== id));
      if (selectedPosition?.id === id) {
        setSelectedPosition(null);
      }
      toast.success('Pozicija obrisana!');
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Greška pri brisanju pozicije');
    }
  }, [selectedPosition]);

  const movePosition = useCallback(async (id: string, x: number, y: number) => {
    // Optimistic update
    setPositions(prev => prev.map(p => 
      p.id === id ? { ...p, x, y } : p
    ));

    try {
      const { error } = await supabase
        .from('positions')
        .update({ x, y })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving position:', error);
      // Revert on error
      fetchPositions();
    }
  }, [fetchPositions]);

  const resizePosition = useCallback(async (id: string, width: number, height: number) => {
    setPositions(prev => prev.map(p =>
      p.id === id ? { ...p, width, height } : p
    ));

    try {
      const { error } = await supabase
        .from('positions')
        .update({ width, height })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error resizing position:', error);
      fetchPositions();
    }
  }, [fetchPositions]);

  const duplicatePosition = useCallback(async (source: Position, x: number, y: number, targetStoreId?: string) => {
    const destStoreId = targetStoreId || storeId;
    if (!destStoreId) return null;

    const positionNumber = `P${String(positions.length + 1).padStart(3, '0')}`;

    try {
      const { data, error } = await supabase
        .from('positions')
        .insert({
          store_id: destStoreId,
          position_number: positionNumber,
          trader: source.trader,
          lease_end_date: source.leaseEndDate,
          lease_value_km: source.leaseValueKm ?? 0,
          position_label: source.positionLabel,
          position_type: source.positionType,
          item_name: source.itemName,
          department: source.department,
          is_free: source.isFree,
          x,
          y,
          width: source.width,
          height: source.height,
          notes: source.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newPosition = mapDbToPosition(data);
      if (!targetStoreId || targetStoreId === storeId) {
        setPositions(prev => [...prev, newPosition]);
        setSelectedPosition(newPosition);
      }
      toast.success('Pozicija kopirana!');
      return newPosition;
    } catch (error) {
      console.error('Error duplicating position:', error);
      toast.error('Greška pri kopiranju pozicije');
      return null;
    }
  }, [storeId, positions.length]);

  const getStats = useCallback(() => {
    const total = positions.length;
    const free = positions.filter(p => p.isFree).length;
    const occupied = total - free;
    const leasedValue = positions.reduce((acc, p) => {
      if (p.isFree) return acc;
      return acc + (p.leaseValueKm ?? 0);
    }, 0);
    const expiringSoon = positions.filter(p => {
      if (!p.leaseEndDate) return false;
      const endDate = new Date(p.leaseEndDate);
      const now = new Date();
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;
    
    const byDepartment = positions.reduce((acc, p) => {
      acc[p.department] = (acc[p.department] || 0) + 1;
      return acc;
    }, {} as Record<Department, number>);

    return { total, free, occupied, expiringSoon, byDepartment, leasedValue };
  }, [positions]);

  return {
    positions,
    filteredPositions,
    selectedPosition,
    setSelectedPosition,
    loading,
    filters,
    setFilters,
    addPosition,
    updatePosition,
    deletePosition,
    movePosition,
    resizePosition,
    duplicatePosition,
    getStats,
    refetch: fetchPositions,
  };
}
