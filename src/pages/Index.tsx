import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { FloorPlanCanvas } from '@/components/FloorPlanCanvas';
import { PositionDetails } from '@/components/PositionDetails';
import { ReportsDialog } from '@/components/ReportsDialog';
import { DepartmentLegend } from '@/components/DepartmentLegend';
import { PositionFilters } from '@/components/PositionFilters';
import { useStores } from '@/hooks/useStores';
import { usePositions } from '@/hooks/usePositions';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [showReports, setShowReports] = useState(false);
  
  const {
    stores,
    currentStore,
    setCurrentStore,
    loading: storesLoading,
    addStore,
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
    getStats,
  } = usePositions(currentStore?.id || null);

  const stats = getStats();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        stores={stores}
        currentStore={currentStore}
        onSelectStore={setCurrentStore}
        onAddStore={addStore}
        onDeleteStore={deleteStore}
        onReportsClick={() => setShowReports(true)}
      />
      
      <StatsCards 
        total={stats.total}
        occupied={stats.occupied}
        free={stats.free}
        expiringSoon={stats.expiringSoon}
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
            onDeletePosition={deletePosition}
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
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Index;
