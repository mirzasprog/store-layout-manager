import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreSelector } from './StoreSelector';
import { Store } from '@/hooks/useStores';

interface HeaderProps {
  stores: Store[];
  currentStore: Store | null;
  onSelectStore: (store: Store) => void;
  onAddStore: (name: string) => void;
  onDeleteStore: (id: string) => void;
  onReportsClick: () => void;
}

export function Header({
  stores,
  currentStore,
  onSelectStore,
  onAddStore,
  onDeleteStore,
  onReportsClick,
}: HeaderProps) {
  return (
    <header className="gradient-header border-b border-sidebar-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Prodajne Pozicije
            </h1>
            <StoreSelector
              stores={stores}
              currentStore={currentStore}
              onSelectStore={onSelectStore}
              onAddStore={onAddStore}
              onDeleteStore={onDeleteStore}
            />
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onReportsClick}
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Izvještaji
        </Button>
      </div>
    </header>
  );
}
