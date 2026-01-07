import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { LeaseValueDashboard } from '@/components/LeaseValueDashboard';
import { FloorPlanCanvas } from '@/components/FloorPlanCanvas';
import { PositionDetails } from '@/components/PositionDetails';
import { ReportsDialog } from '@/components/ReportsDialog';
import { DepartmentLegend } from '@/components/DepartmentLegend';
import { PositionFilters } from '@/components/PositionFilters';
import { ExportDialog } from '@/components/ExportDialog';
import { useStores } from '@/hooks/useStores';
import { usePositions } from '@/hooks/usePositions';
import { useLeaseTotals } from '@/hooks/useLeaseTotals';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [showReports, setShowReports] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  const {
    stores,
    currentStore,
    setCurrentStore,
    loading: storesLoading,
    addStore,
    updateStore,
    renameStore,
    deleteStore,
  } = useStores();

  const {
    positions,
    filteredPositions,
    selectedPosition,
    setSelectedPosition,
    loading: positionsLoading,
    filters,
    setFilters,
    addPosition,
    updatePosition,
    deletePosition,
    movePosition,
    resizePosition,
    duplicatePosition,
    getStats,
  } = usePositions(currentStore?.id || null);

  const stats = getStats();
  const currentLeasedCount = positions.filter(position => !position.isFree).length;
  const { storeTotals, labelTotals, totalValue, loading: leaseTotalsLoading } = useLeaseTotals(stores);
  const loading = storesLoading || positionsLoading;

  if (storesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    );
  }

  const handleUpdateFloorPlan = async (url: string | null) => {
    if (currentStore) {
      await updateStore(currentStore.id, { floor_plan_url: url });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        stores={stores}
        currentStore={currentStore}
        onSelectStore={setCurrentStore}
        onAddStore={addStore}
        onDeleteStore={deleteStore}
        onRenameStore={renameStore}
        onUpdateFloorPlan={handleUpdateFloorPlan}
        onReportsClick={() => setShowReports(true)}
        onExportClick={() => setShowExport(true)}
      />
      
      <StatsCards 
        total={stats.total}
        occupied={stats.occupied}
        free={stats.free}
        expiringSoon={stats.expiringSoon}
        leasedValue={stats.leasedValue}
      />

      <LeaseValueDashboard
        currentStoreName={currentStore?.name || 'Prodavnica'}
        currentStoreValue={stats.leasedValue}
        currentStoreLeasedCount={currentLeasedCount}
        totalValue={totalValue}
        storeTotals={storeTotals}
        labelTotals={labelTotals}
        loading={leaseTotalsLoading}
      />

      <PositionFilters
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredPositions.length}
        totalCount={positions.length}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <FloorPlanCanvas
            positions={filteredPositions}
            selectedPosition={selectedPosition}
            onSelectPosition={setSelectedPosition}
            onAddPosition={addPosition}
            onMovePosition={movePosition}
            onResizePosition={resizePosition}
            onDeletePosition={deletePosition}
            onDuplicatePosition={duplicatePosition}
            floorPlanUrl={currentStore?.floor_plan_url || null}
          />
          <DepartmentLegend />
        </div>

        {selectedPosition && (
          <PositionDetails
            position={selectedPosition}
            onUpdate={updatePosition}
            onClose={() => setSelectedPosition(null)}
          />
        )}
      </div>

      <ReportsDialog
        open={showReports}
        onOpenChange={setShowReports}
        positions={positions}
      />

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        positions={positions}
        storeName={currentStore?.name || 'Prodavnica'}
      />
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;
