export type Department = 
  | 'voce-povrce'
  | 'svjeza'
  | 'neprehrana1'
  | 'neprehrana2'
  | 'delikates'
  | 'gastro'
  | 'slobodna';

export interface Position {
  id: string;
  positionNumber: string;
  trader: string;
  leaseEndDate: string | null;
  department: Department;
  isFree: boolean;
  x: number;
  y: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  floorPlanUrl: string | null;
  positions: Position[];
}

export const DEPARTMENTS: { value: Department; label: string; color: string }[] = [
  { value: 'voce-povrce', label: 'Voće i povrće', color: 'dept-voce' },
  { value: 'svjeza', label: 'Svježa', color: 'dept-svjeza' },
  { value: 'neprehrana1', label: 'Neprehrana 1', color: 'dept-neprehrana1' },
  { value: 'neprehrana2', label: 'Neprehrana 2', color: 'dept-neprehrana2' },
  { value: 'delikates', label: 'Delikates', color: 'dept-delikates' },
  { value: 'gastro', label: 'Gastro', color: 'dept-gastro' },
  { value: 'slobodna', label: 'Slobodna pozicija', color: 'dept-slobodna' },
];

export const getDepartmentInfo = (dept: Department) => {
  return DEPARTMENTS.find(d => d.value === dept) || DEPARTMENTS[6];
};
