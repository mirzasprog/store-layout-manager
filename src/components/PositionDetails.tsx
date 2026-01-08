import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Position, Department, DEPARTMENTS } from '@/types/position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface PositionDetailsProps {
  position: Position;
  onUpdate: (id: string, updates: Partial<Position>) => void;
  onClose: () => void;
}

export function PositionDetails({ position, onUpdate, onClose }: PositionDetailsProps) {
  const [formData, setFormData] = useState({
    positionNumber: position.positionNumber,
    trader: position.trader,
    leaseEndDate: position.leaseEndDate || '',
    leaseValueKm: position.leaseValueKm ?? 0,
    positionLabel: position.positionLabel,
    positionType: position.positionType,
    itemName: position.itemName,
    department: position.department,
    notes: position.notes || '',
  });

  useEffect(() => {
    setFormData({
      positionNumber: position.positionNumber,
      trader: position.trader,
      leaseEndDate: position.leaseEndDate || '',
      leaseValueKm: position.leaseValueKm ?? 0,
      positionLabel: position.positionLabel,
      positionType: position.positionType,
      itemName: position.itemName,
      department: position.department,
      notes: position.notes || '',
    });
  }, [position]);

  const handleSave = () => {
    onUpdate(position.id, {
      positionNumber: formData.positionNumber,
      trader: formData.trader,
      leaseEndDate: formData.leaseEndDate || null,
      leaseValueKm: Number.isFinite(formData.leaseValueKm) ? formData.leaseValueKm : 0,
      positionLabel: formData.positionLabel,
      positionType: formData.positionType,
      itemName: formData.itemName,
      department: formData.department as Department,
      notes: formData.notes,
    });
    toast.success('Pozicija ažurirana!');
  };

  const filteredDepartments = formData.trader.trim() 
    ? DEPARTMENTS.filter(d => d.value !== 'slobodna')
    : DEPARTMENTS;

  const positionTypeOptions = [
    { value: 'nije-postavljeno', label: 'Nije postavljeno' },
    { value: 'bocna-polica', label: 'Bočna polica' },
    { value: 'gondola', label: 'Gondola' },
    { value: 'frizider', label: 'Frižider' },
    { value: 'kasa', label: 'Kasa' },
    { value: 'promo-zona', label: 'Promo zona' },
    { value: 'otok', label: 'Otok' },
  ];

  return (
    <div className="w-80 border-l border-border bg-card h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Detalji pozicije</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="positionNumber">Broj pozicije</Label>
          <Input
            id="positionNumber"
            value={formData.positionNumber}
            onChange={(e) => setFormData(f => ({ ...f, positionNumber: e.target.value }))}
            placeholder="npr. P001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trader">Trgovac</Label>
          <Input
            id="trader"
            value={formData.trader}
            onChange={(e) => setFormData(f => ({ ...f, trader: e.target.value }))}
            placeholder="Naziv firme / trgovca"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaseEndDate">Zakup do</Label>
          <Input
            id="leaseEndDate"
            type="date"
            value={formData.leaseEndDate}
            onChange={(e) => setFormData(f => ({ ...f, leaseEndDate: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leaseValueKm">Vrijednost zakupa (KM)</Label>
          <Input
            id="leaseValueKm"
            type="number"
            min="0"
            step="0.01"
            value={formData.leaseValueKm}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Number(e.target.value);
              setFormData(f => ({ ...f, leaseValueKm: value }));
            }}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="positionLabel">Naziv pozicije</Label>
          <Input
            id="positionLabel"
            value={formData.positionLabel}
            onChange={(e) => setFormData(f => ({ ...f, positionLabel: e.target.value }))}
            placeholder="npr. Gratis"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="positionType">Tip pozicije</Label>
          <Select
            value={formData.positionType}
            onValueChange={(value) => setFormData(f => ({ ...f, positionType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite tip" />
            </SelectTrigger>
            <SelectContent>
              {positionTypeOptions.map((option) => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemName">Naziv artikla</Label>
          <Input
            id="itemName"
            value={formData.itemName}
            onChange={(e) => setFormData(f => ({ ...f, itemName: e.target.value }))}
            placeholder="Artikal na poziciji"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Odjel</Label>
          <Select
            value={formData.department}
            onValueChange={(value: Department) => setFormData(f => ({ ...f, department: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Odaberite odjel" />
            </SelectTrigger>
            <SelectContent>
              {filteredDepartments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-3 h-3 rounded-full bg-${dept.color}`}
                      style={{ 
                        backgroundColor: `hsl(var(--${dept.color}))` 
                      }}
                    />
                    {dept.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Napomene</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
            placeholder="Dodatne informacije..."
            rows={3}
          />
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Kreirano: {new Date(position.createdAt).toLocaleDateString('hr-HR')}</p>
          <p>Ažurirano: {new Date(position.updatedAt).toLocaleDateString('hr-HR')}</p>
          <p>Status: {position.isFree ? 'Slobodno' : 'Zauzeto'}</p>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" />
          Spremi promjene
        </Button>
      </div>
    </div>
  );
}
