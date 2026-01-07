import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Position, DEPARTMENTS } from '@/types/position';
import { exportToExcel, filterPositionsForExport, ExportFilters } from '@/lib/excelExport';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: Position[];
  storeName: string;
}

export function ExportDialog({ open, onOpenChange, positions, storeName }: ExportDialogProps) {
  const [filters, setFilters] = useState<ExportFilters>({
    department: 'all',
    status: 'all',
    searchQuery: '',
  });

  const filteredCount = filterPositionsForExport(positions, filters).length;

  const handleExport = () => {
    exportToExcel(positions, filters, storeName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Izvoz u Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Filtriraj po odjelu</Label>
            <Select
              value={filters.department}
              onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi odjeli</SelectItem>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filtriraj po statusu</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as ExportFilters['status'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="free">Slobodne</SelectItem>
                <SelectItem value="occupied">Zauzete</SelectItem>
                <SelectItem value="expiring">Ističu uskoro (30 dana)</SelectItem>
                <SelectItem value="expired">Istekle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pretraži po broju/trgovcu</Label>
            <Input
              placeholder="Unesite pojam za pretragu..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">
              Pronađeno <span className="font-semibold text-foreground">{filteredCount}</span> od {positions.length} pozicija
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Odustani
          </Button>
          <Button onClick={handleExport} disabled={filteredCount === 0} className="gap-2">
            <Download className="w-4 h-4" />
            Izvezi ({filteredCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
