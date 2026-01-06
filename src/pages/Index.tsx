import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { FloorPlanCanvas } from '@/components/FloorPlanCanvas';
import { PositionDetails } from '@/components/PositionDetails';
import { ReportsDialog } from '@/components/ReportsDialog';
import { DepartmentLegend } from '@/components/DepartmentLegend';
import { usePositions } from '@/hooks/usePositions';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [showReports, setShowReports] = useState(false);
  const {
    positions,
    selectedPosition,
    setSelectedPosition,
    addPosition,
    updatePosition,
    deletePosition,
    movePosition,
    getStats,
  } = usePositions();

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        storeName="Prodavnica 001 - Sarajevo Centar" 
        onReportsClick={() => setShowReports(true)}
      />
      
      <StatsCards 
        total={stats.total}
        occupied={stats.occupied}
        free={stats.free}
        expiringSoon={stats.expiringSoon}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <FloorPlanCanvas
            positions={positions}
            selectedPosition={selectedPosition}
            onSelectPosition={setSelectedPosition}
            onAddPosition={addPosition}
            onMovePosition={movePosition}
            onDeletePosition={deletePosition}
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
