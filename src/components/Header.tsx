import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreSelector } from './StoreSelector';
import { FloorPlanUpload } from './FloorPlanUpload';
import { Store } from '@/hooks/useStores';

interface HeaderProps {
  stores: Store[];
  currentStore: Store | null;
  onSelectStore: (store: Store) => void;
  onAddStore: (name: string) => void;
  onDeleteStore: (id: string) => void;
  onRenameStore: (id: string, name: string) => void;
  onUpdateFloorPlan: (url: string | null) => void;
  onReportsClick: () => void;
  onExportClick: () => void;
}

export function Header({
  stores,
  currentStore,
  onSelectStore,
  onAddStore,
  onDeleteStore,
  onRenameStore,
  onUpdateFloorPlan,
  onReportsClick,
  onExportClick,
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
              onRenameStore={onRenameStore}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentStore && (
            <FloorPlanUpload
              storeId={currentStore.id}
              currentUrl={currentStore.floor_plan_url}
              onUploadComplete={onUpdateFloorPlan}
            />
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportClick}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          
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
      </div>
    </header>
  );
}
