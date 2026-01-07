import * as XLSX from 'xlsx';
import { Position, getDepartmentInfo } from '@/types/position';

export interface ExportFilters {
  department: string;
  status: 'all' | 'free' | 'occupied' | 'expiring' | 'expired';
  searchQuery: string;
}

export function filterPositionsForExport(positions: Position[], filters: ExportFilters): Position[] {
  return positions.filter(p => {
    // Department filter
    if (filters.department !== 'all' && p.department !== filters.department) {
      return false;
    }

    // Status filter
    const now = new Date();
    if (filters.status === 'free' && !p.isFree) return false;
    if (filters.status === 'occupied' && p.isFree) return false;
    if (filters.status === 'expiring') {
      if (!p.leaseEndDate) return false;
      const endDate = new Date(p.leaseEndDate);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0 || diffDays > 30) return false;
    }
    if (filters.status === 'expired') {
      if (!p.leaseEndDate) return false;
      if (new Date(p.leaseEndDate) >= now) return false;
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesNumber = p.positionNumber.toLowerCase().includes(query);
      const matchesTrader = p.trader?.toLowerCase().includes(query);
      const matchesLabel = p.positionLabel?.toLowerCase().includes(query);
      const matchesType = p.positionType?.toLowerCase().includes(query);
      const matchesItem = p.itemName?.toLowerCase().includes(query);
      if (!matchesNumber && !matchesTrader && !matchesLabel && !matchesType && !matchesItem) return false;
    }

    return true;
  });
}

export function exportToExcel(
  positions: Position[], 
  filters: ExportFilters,
  storeName: string
): void {
  const filteredPositions = filterPositionsForExport(positions, filters);

  // Prepare data for Excel
  const data = filteredPositions.map(p => ({
    'Broj pozicije': p.positionNumber,
    'Trgovac': p.trader || '-',
    'Naziv pozicije': p.positionLabel || '-',
    'Tip pozicije': p.positionType || '-',
    'Artikal': p.itemName || '-',
    'Odjel': getDepartmentInfo(p.department).label,
    'Zakup do': p.leaseEndDate 
      ? new Date(p.leaseEndDate).toLocaleDateString('hr-HR')
      : '-',
    'Vrijednost (KM)': p.leaseValueKm ?? 0,
    'Status': p.isFree ? 'Slobodno' : 'Zauzeto',
    'Napomene': p.notes || '-',
    'X koordinata': Math.round(p.x),
    'Y koordinata': Math.round(p.y),
    'Širina': Math.round(p.width),
    'Visina': Math.round(p.height),
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Broj pozicije
    { wch: 25 }, // Trgovac
    { wch: 20 }, // Naziv pozicije
    { wch: 18 }, // Tip pozicije
    { wch: 20 }, // Artikal
    { wch: 15 }, // Odjel
    { wch: 12 }, // Zakup do
    { wch: 14 }, // Vrijednost
    { wch: 10 }, // Status
    { wch: 30 }, // Napomene
    { wch: 12 }, // X
    { wch: 12 }, // Y
    { wch: 10 }, // Širina
    { wch: 10 }, // Visina
  ];

  // Add worksheet to workbook
  const sheetName = storeName.substring(0, 31); // Excel sheet name max 31 chars
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Add summary sheet
  const summaryData = [
    { 'Metrika': 'Ukupno pozicija', 'Vrijednost': filteredPositions.length },
    { 'Metrika': 'Zauzeto', 'Vrijednost': filteredPositions.filter(p => !p.isFree).length },
    { 'Metrika': 'Slobodno', 'Vrijednost': filteredPositions.filter(p => p.isFree).length },
    { 'Metrika': 'Jedinstvenih trgovaca', 'Vrijednost': new Set(filteredPositions.filter(p => p.trader).map(p => p.trader)).size },
    { 'Metrika': 'Vrijednost zakupa (KM)', 'Vrijednost': filteredPositions.reduce((acc, p) => acc + (p.isFree ? 0 : (p.leaseValueKm ?? 0)), 0) },
    { 'Metrika': 'Datum izvoza', 'Vrijednost': new Date().toLocaleString('hr-HR') },
    { 'Metrika': 'Prodavnica', 'Vrijednost': storeName },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Sažetak');

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `pozicije-${storeName.replace(/\s+/g, '-')}-${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}
