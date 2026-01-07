import { useRef, useState, useCallback, useEffect } from 'react';
import { Plus, Move, ZoomIn, ZoomOut, Upload, Copy, ClipboardPaste } from 'lucide-react';
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
  onResizePosition: (id: string, width: number, height: number) => void;
  onDeletePosition: (id: string) => void;
  onDuplicatePosition: (source: Position, x: number, y: number) => void;
  floorPlanUrl?: string | null;
}

type Tool = 'select' | 'add';

export function FloorPlanCanvas({
  positions,
  selectedPosition,
  onSelectPosition,
  onAddPosition,
  onMovePosition,
  onResizePosition,
  onDeletePosition,
  onDuplicatePosition,
  floorPlanUrl,
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeOrigin, setResizeOrigin] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [copiedPosition, setCopiedPosition] = useState<Position | null>(null);

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

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, position: Position) => {
    e.stopPropagation();
    onSelectPosition(position);
    setResizingId(position.id);
    setResizeOrigin({
      x: e.clientX,
      y: e.clientY,
      width: position.width,
      height: position.height,
    });
  }, [onSelectPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (resizingId) {
      const deltaX = (e.clientX - resizeOrigin.x) / scale;
      const deltaY = (e.clientY - resizeOrigin.y) / scale;
      const nextWidth = Math.max(32, resizeOrigin.width + deltaX);
      const nextHeight = Math.max(32, resizeOrigin.height + deltaY);
      onResizePosition(resizingId, nextWidth, nextHeight);
      return;
    }

    if (!draggingId) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - dragOffset.x) / scale;
    const y = (e.clientY - rect.top - dragOffset.y) / scale;
    
    onMovePosition(draggingId, Math.max(20, x), Math.max(20, y));
  }, [draggingId, dragOffset, scale, onMovePosition, onResizePosition, resizeOrigin, resizingId]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setResizingId(null);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleCopy = () => {
    if (!selectedPosition) return;
    setCopiedPosition(selectedPosition);
    toast.success('Pozicija kopirana.');
  };

  const handlePaste = () => {
    if (!copiedPosition) {
      toast.error('Nema kopirane pozicije.');
      return;
    }
    const offset = 20;
    const newX = copiedPosition.x + offset;
    const newY = copiedPosition.y + offset;
    onDuplicatePosition(copiedPosition, newX, newY);
    toast.success('Pozicija zalijepljena.');
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
            disabled={!selectedPosition}
          >
            <Copy className="w-4 h-4" />
            Kopiraj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="gap-2"
            disabled={!copiedPosition}
          >
            <ClipboardPaste className="w-4 h-4" />
            Zalijepi
          </Button>
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
        {floorPlanUrl && (
          <img
            src={floorPlanUrl}
            alt="Floor plan"
            className="absolute top-0 left-0 pointer-events-none opacity-60"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        )}

        {!floorPlanUrl && positions.length === 0 && (
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
            onResizeMouseDown={(e) => handleResizeMouseDown(e, position)}
            onDelete={() => onDeletePosition(position.id)}
          />
        ))}
      </div>
    </div>
  );
}
