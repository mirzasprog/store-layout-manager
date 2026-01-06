import { useState, useCallback } from 'react';
import { Position, Department } from '@/types/position';

const generateId = () => Math.random().toString(36).substring(2, 15);

const INITIAL_POSITIONS: Position[] = [
  {
    id: generateId(),
    positionNumber: 'P001',
    trader: 'Mlinar d.o.o.',
    leaseEndDate: '2025-06-30',
    department: 'svjeza',
    isFree: false,
    x: 150,
    y: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    positionNumber: 'P002',
    trader: 'Agroprodukt',
    leaseEndDate: '2025-03-15',
    department: 'voce-povrce',
    isFree: false,
    x: 300,
    y: 250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    positionNumber: 'P003',
    trader: '',
    leaseEndDate: null,
    department: 'slobodna',
    isFree: true,
    x: 450,
    y: 180,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    positionNumber: 'P004',
    trader: 'Gastro Plus',
    leaseEndDate: '2025-12-31',
    department: 'gastro',
    isFree: false,
    x: 200,
    y: 400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    positionNumber: 'P005',
    trader: 'Elektronika BH',
    leaseEndDate: '2025-09-01',
    department: 'neprehrana1',
    isFree: false,
    x: 550,
    y: 350,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const addPosition = useCallback((x: number, y: number) => {
    const newPosition: Position = {
      id: generateId(),
      positionNumber: `P${String(positions.length + 1).padStart(3, '0')}`,
      trader: '',
      leaseEndDate: null,
      department: 'slobodna',
      isFree: true,
      x,
      y,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPositions(prev => [...prev, newPosition]);
    setSelectedPosition(newPosition);
    return newPosition;
  }, [positions.length]);

  const updatePosition = useCallback((id: string, updates: Partial<Position>) => {
    setPositions(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        if (updated.trader && updated.trader.trim() !== '') {
          updated.isFree = false;
          if (updated.department === 'slobodna') {
            updated.department = 'svjeza';
          }
        } else if (!updated.trader || updated.trader.trim() === '') {
          updated.isFree = true;
          updated.department = 'slobodna';
        }
        return updated;
      }
      return p;
    }));
  }, []);

  const deletePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    setSelectedPosition(null);
  }, []);

  const movePosition = useCallback((id: string, x: number, y: number) => {
    setPositions(prev => prev.map(p => 
      p.id === id ? { ...p, x, y, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const getStats = useCallback(() => {
    const total = positions.length;
    const free = positions.filter(p => p.isFree).length;
    const occupied = total - free;
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

    return { total, free, occupied, expiringSoon, byDepartment };
  }, [positions]);

  return {
    positions,
    selectedPosition,
    setSelectedPosition,
    addPosition,
    updatePosition,
    deletePosition,
    movePosition,
    getStats,
  };
}
