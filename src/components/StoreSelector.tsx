import { useState } from 'react';
import { Building2, Plus, ChevronDown, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Store } from '@/hooks/useStores';

interface StoreSelectorProps {
  stores: Store[];
  currentStore: Store | null;
  onSelectStore: (store: Store) => void;
  onAddStore: (name: string) => void;
  onDeleteStore: (id: string) => void;
}

export function StoreSelector({
  stores,
  currentStore,
  onSelectStore,
  onAddStore,
  onDeleteStore,
}: StoreSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Store | null>(null);

  const handleAddStore = () => {
    if (newStoreName.trim()) {
      onAddStore(newStoreName.trim());
      setNewStoreName('');
      setIsAdding(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-auto py-1">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-medium">{currentStore?.name || 'Odaberi prodavnicu'}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {stores.map((store) => (
            <DropdownMenuItem
              key={store.id}
              className="flex items-center justify-between group"
              onClick={() => onSelectStore(store)}
            >
              <span className={currentStore?.id === store.id ? 'font-semibold' : ''}>
                {store.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(store);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </DropdownMenuItem>
          ))}
          
          {stores.length > 0 && <DropdownMenuSeparator />}
          
          {isAdding ? (
            <div className="p-2 flex items-center gap-2">
              <Input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Naziv prodavnice..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddStore();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewStoreName('');
                  }
                }}
              />
              <Button size="icon" className="h-8 w-8" onClick={handleAddStore}>
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setIsAdding(false);
                  setNewStoreName('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenuItem onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova prodavnica
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši prodavnicu?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja će trajno obrisati prodavnicu "{deleteConfirm?.name}" i sve njene pozicije. 
              Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) {
                  onDeleteStore(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
