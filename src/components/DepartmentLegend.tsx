import { DEPARTMENTS } from '@/types/position';

export function DepartmentLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-card border-t border-border">
      <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
      {DEPARTMENTS.map((dept) => (
        <div key={dept.value} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `hsl(var(--${dept.color}))` }}
          />
          <span className="text-sm text-muted-foreground">{dept.label}</span>
        </div>
      ))}
    </div>
  );
}
