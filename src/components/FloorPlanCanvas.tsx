import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Plus, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Position } from '@/types/position';
import { PositionBalloon } from './PositionBalloon';
import { toast } from 'sonner';

interface FloorPlanCanvasProps {
  positions: Position[];
  selectedPosition: Position | null;
  onSelectPosition: (position: Position | null) => void;
  onAddPosition: (x: number, y: number) => void;
  onMovePosition: (id: string, x: number, y: number) => void;
  onDeletePosition: (id: string) => void;
  floorPlanUrl?: string | null;
}

type Tool = 'select' | 'add';

export function FloorPlanCanvas({
  positions,
  selectedPosition,
  onSelectPosition,
  onAddPosition,
  onMovePosition,
  onDeletePosition,
  floorPlanUrl,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localFloorPlan, setLocalFloorPlan] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const floorPlanImage = floorPlanUrl || localFloorPlan;

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.dwg')) {
      toast.error('Podržani formati: JPEG, PNG, WebP, PDF');
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalFloorPlan(e.target?.result as string);
        toast.success('Nacrt uspješno učitan!');
      };
      reader.readAsDataURL(file);
    } else {
      toast.info('PDF i DWG datoteke će biti pretvorene u sliku. Za sada učitajte JPEG/PNG verziju nacrta.');
    }
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'add') return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    onAddPosition(x, y);
    setActiveTool('select');
    toast.success('Nova pozicija dodana!');
  }, [activeTool, scale, onAddPosition]);

  const handleBalloonMouseDown = useCallback((e: React.MouseEvent, position: Position) => {
    e.stopPropagation();
    
    if (activeTool === 'select') {
      onSelectPosition(position);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDraggingId(position.id);
        setDragOffset({
          x: e.clientX - rect.left - position.x * scale,
          y: e.clientY - rect.top - position.y * scale,
        });
      }
    }
  }, [activeTool, scale, onSelectPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - dragOffset.x) / scale;
    const y = (e.clientY - rect.top - dragOffset.y) / scale;
    
    onMovePosition(draggingId, Math.max(20, x), Math.max(20, y));
  }, [draggingId, dragOffset, scale, onMovePosition]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingId(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('select')}
            className="gap-2"
          >
            <Move className="w-4 h-4" />
            Odaberi
          </Button>
          <Button
            variant={activeTool === 'add' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('add')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Dodaj poziciju
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf,.dwg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
              <Upload className="w-4 h-4" />
              Učitaj nacrt
            </Button>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale(s => Math.min(2, s + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-auto canvas-grid ${activeTool === 'add' ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ minHeight: '500px' }}
      >
        {floorPlanImage && (
          <img
            src={floorPlanImage}
            alt="Floor plan"
            className="absolute top-0 left-0 pointer-events-none opacity-60"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        )}

        {!floorPlanImage && positions.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Učitajte nacrt prodavnice</p>
            <p className="text-sm">ili kliknite "Dodaj poziciju" za dodavanje pozicija na praznu podlogu</p>
          </div>
        )}

        {/* Position Balloons */}
        {positions.map((position) => (
          <PositionBalloon
            key={position.id}
            position={position}
            isSelected={selectedPosition?.id === position.id}
            isDragging={draggingId === position.id}
            scale={scale}
            onMouseDown={(e) => handleBalloonMouseDown(e, position)}
            onDelete={() => onDeletePosition(position.id)}
          />
        ))}
      </div>
    </div>
  );
}
