import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, Department } from '@/types/position';
import { PositionFilters as Filters } from '@/hooks/usePositions';

interface PositionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  resultCount: number;
  totalCount: number;
}

export function PositionFilters({
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: PositionFiltersProps) {
  const hasActiveFilters = 
    filters.department !== 'all' || 
    filters.status !== 'all' || 
    filters.search !== '';

  const clearFilters = () => {
    onFiltersChange({
      department: 'all',
      status: 'all',
      search: '',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-card border-b border-border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži po broju ili trgovcu..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 h-9"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => onFiltersChange({ ...filters, search: '' })}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Department Filter */}
      <Select
        value={filters.department}
        onValueChange={(value) => onFiltersChange({ ...filters, department: value as Department | 'all' })}
      >
        <SelectTrigger className="w-[180px] h-9">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Svi odjeli" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Svi odjeli</SelectItem>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.value} value={dept.value}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${dept.color}`} />
                {dept.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as Filters['status'] })}
      >
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Svi statusi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Svi statusi</SelectItem>
          <SelectItem value="occupied">Zauzete</SelectItem>
          <SelectItem value="free">Slobodne</SelectItem>
          <SelectItem value="expiring">Ističu uskoro</SelectItem>
        </SelectContent>
      </Select>

      {/* Results count & Clear */}
      <div className="flex items-center gap-2 ml-auto">
        {hasActiveFilters && (
          <>
            <Badge variant="secondary" className="font-normal">
              {resultCount} od {totalCount}
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
              <X className="w-4 h-4 mr-1" />
              Očisti filtere
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
