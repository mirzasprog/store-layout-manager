import { Trash2 } from 'lucide-react';
import { Position, getDepartmentInfo } from '@/types/position';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PositionBalloonProps {
  position: Position;
  isSelected: boolean;
  isDragging: boolean;
  scale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

const getDepartmentColorClass = (dept: string): string => {
  const colors: Record<string, string> = {
    'voce-povrce': 'bg-dept-voce',
    'svjeza': 'bg-dept-svjeza',
    'neprehrana1': 'bg-dept-neprehrana1',
    'neprehrana2': 'bg-dept-neprehrana2',
    'delikates': 'bg-dept-delikates',
    'gastro': 'bg-dept-gastro',
    'slobodna': 'bg-dept-slobodna',
  };
  return colors[dept] || 'bg-muted';
};

export function PositionBalloon({
  position,
  isSelected,
  isDragging,
  scale,
  onMouseDown,
  onResizeMouseDown,
  onDelete,
}: PositionBalloonProps) {
  const deptInfo = getDepartmentInfo(position.department);
  const colorClass = getDepartmentColorClass(position.department);

  const isExpiringSoon = position.leaseEndDate && (() => {
    const endDate = new Date(position.leaseEndDate);
    const now = new Date();
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  })();

  const balloonWidth = Math.max(32, position.width * scale);
  const balloonHeight = Math.max(32, position.height * scale);
  const fontSize = Math.max(10, 12 * scale);
  const deleteButtonSize = Math.max(16, 24 * scale);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : 'z-10'}`}
          style={{
            left: position.x * scale,
            top: position.y * scale,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={onMouseDown}
        >
          {/* Balloon */}
          <div 
            className={`
              relative flex items-center justify-center rounded-lg 
              ${colorClass} text-white font-semibold shadow-balloon
              transition-all duration-200
              ${isSelected ? 'ring-2 ring-offset-2 ring-ring' : 'hover:brightness-110'}
              ${isDragging ? 'opacity-90' : ''}
            `}
            style={{
              width: `${balloonWidth}px`,
              height: `${balloonHeight}px`,
              fontSize: `${fontSize}px`,
            }}
          >
            {position.positionNumber}
            
            {/* Expiring indicator */}
            {isExpiringSoon && (
              <span 
                className="absolute bg-warning rounded-full animate-pulse"
                style={{
                  width: `${Math.max(8, 12 * scale)}px`,
                  height: `${Math.max(8, 12 * scale)}px`,
                  top: `${-Math.max(2, 4 * scale)}px`,
                  right: `${-Math.max(2, 4 * scale)}px`,
                }}
              />
            )}

            {/* Pointer */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0`}
              style={{ 
                borderTopColor: 'inherit',
                borderLeftWidth: `${Math.max(4, 6 * scale)}px`,
                borderRightWidth: `${Math.max(4, 6 * scale)}px`,
                borderTopWidth: `${Math.max(6, 8 * scale)}px`,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                bottom: `${-Math.max(6, 8 * scale)}px`,
              }}
            />

            {isSelected && (
              <button
                type="button"
                className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-background border border-muted-foreground rounded-sm shadow cursor-se-resize"
                style={{ width: `${Math.max(8, 10 * scale)}px`, height: `${Math.max(8, 10 * scale)}px` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeMouseDown(e);
                }}
              />
            )}
          </div>

          {/* Delete button - only show when selected */}
          {isSelected && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute rounded-full animate-scale-in"
              style={{
                width: `${deleteButtonSize}px`,
                height: `${deleteButtonSize}px`,
                top: `${-deleteButtonSize / 3}px`,
                right: `${-deleteButtonSize / 3}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 style={{ width: `${Math.max(10, 12 * scale)}px`, height: `${Math.max(10, 12 * scale)}px` }} />
            </Button>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{position.positionNumber}</p>
          {position.trader && <p className="text-sm">Trgovac: {position.trader}</p>}
          {position.positionLabel && <p className="text-sm">Naziv: {position.positionLabel}</p>}
          {position.positionType && <p className="text-sm">Tip: {position.positionType}</p>}
          {position.itemName && <p className="text-sm">Artikal: {position.itemName}</p>}
          <p className="text-sm">Odjel: {deptInfo.label}</p>
          {position.leaseEndDate && (
            <p className="text-sm">
              Zakup do: {new Date(position.leaseEndDate).toLocaleDateString('hr-HR')}
            </p>
          )}
          {!position.isFree && position.leaseValueKm !== null && (
            <p className="text-sm">Vrijednost: {position.leaseValueKm.toFixed(2)} KM</p>
          )}
          {position.isFree && <p className="text-sm text-success">Slobodna pozicija</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
