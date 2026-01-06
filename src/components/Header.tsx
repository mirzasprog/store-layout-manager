import { Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  storeName: string;
  onReportsClick: () => void;
}

export function Header({ storeName, onReportsClick }: HeaderProps) {
  return (
    <header className="gradient-header border-b border-sidebar-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Prodajne Pozicije
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              {storeName}
            </p>
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
