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
              relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg 
              ${colorClass} text-white font-semibold text-sm shadow-balloon
              transition-all duration-200
              ${isSelected ? 'ring-2 ring-offset-2 ring-ring scale-110' : 'hover:scale-105'}
              ${isDragging ? 'opacity-90' : ''}
            `}
          >
            {position.positionNumber}
            
            {/* Expiring indicator */}
            {isExpiringSoon && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse" />
            )}

            {/* Pointer */}
            <div 
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                border-l-[6px] border-l-transparent 
                border-r-[6px] border-r-transparent 
                border-t-[8px] ${colorClass.replace('bg-', 'border-t-')}`}
              style={{ borderTopColor: 'inherit' }}
            />
          </div>

          {/* Delete button - only show when selected */}
          {isSelected && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-scale-in"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{position.positionNumber}</p>
          {position.trader && <p className="text-sm">Trgovac: {position.trader}</p>}
          <p className="text-sm">Odjel: {deptInfo.label}</p>
          {position.leaseEndDate && (
            <p className="text-sm">
              Zakup do: {new Date(position.leaseEndDate).toLocaleDateString('hr-HR')}
            </p>
          )}
          {position.isFree && <p className="text-sm text-success">Slobodna pozicija</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
