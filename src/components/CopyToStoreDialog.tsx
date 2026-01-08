import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Position } from '@/types/position';
import { Store } from '@/hooks/useStores';
import { Copy } from 'lucide-react';

interface CopyToStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: Position | null;
  stores: Store[];
  currentStoreId: string | null;
  onCopyToStore: (position: Position, targetStoreId: string) => void;
}

export function CopyToStoreDialog({
  open,
  onOpenChange,
  position,
  stores,
  currentStoreId,
  onCopyToStore,
}: CopyToStoreDialogProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  const availableStores = stores.filter(s => s.id !== currentStoreId);

  const handleCopy = () => {
    if (!position || !selectedStoreId) return;
    onCopyToStore(position, selectedStoreId);
    onOpenChange(false);
    setSelectedStoreId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Kopiraj poziciju u drugu prodavnicu
          </DialogTitle>
          <DialogDescription>
            Odaberite prodavnicu u koju želite kopirati poziciju {position?.positionNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="store">Odredišna prodavnica</Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite prodavnicu" />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {availableStores.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nema dostupnih prodavnica za kopiranje. Dodajte novu prodavnicu.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Odustani
          </Button>
          <Button 
            onClick={handleCopy} 
            disabled={!selectedStoreId || availableStores.length === 0}
          >
            <Copy className="w-4 h-4 mr-2" />
            Kopiraj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
