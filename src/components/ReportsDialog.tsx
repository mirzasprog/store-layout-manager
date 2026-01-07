import { useMemo } from 'react';
import { Download, PieChart, BarChart3, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { Position, DEPARTMENTS, Department, getDepartmentInfo } from '@/types/position';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: Position[];
}

export function ReportsDialog({ open, onOpenChange, positions }: ReportsDialogProps) {
  const stats = useMemo(() => {
    const total = positions.length;
    const free = positions.filter(p => p.isFree).length;
    const occupied = total - free;
    
    const now = new Date();
    const expiringSoon = positions.filter(p => {
      if (!p.leaseEndDate) return false;
      const endDate = new Date(p.leaseEndDate);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    });

    const expired = positions.filter(p => {
      if (!p.leaseEndDate) return false;
      return new Date(p.leaseEndDate) < now;
    });

    const byDepartment = DEPARTMENTS.filter(d => d.value !== 'slobodna').map(dept => ({
      ...dept,
      count: positions.filter(p => p.department === dept.value).length,
      percentage: Math.round((positions.filter(p => p.department === dept.value).length / total) * 100) || 0,
    }));

    const uniqueTraders = new Set(positions.filter(p => p.trader).map(p => p.trader)).size;
    const leasedValue = positions.reduce((acc, p) => {
      if (p.isFree) return acc;
      return acc + (p.leaseValueKm ?? 0);
    }, 0);

    const byPositionLabel = positions.reduce((acc, p) => {
      if (p.isFree) return acc;
      const label = p.positionLabel?.trim() || 'Bez naziva';
      acc[label] = (acc[label] || 0) + (p.leaseValueKm ?? 0);
      return acc;
    }, {} as Record<string, number>);

    const byPositionType = positions.reduce((acc, p) => {
      if (p.isFree) return acc;
      const label = p.positionType?.trim() || 'Nedefinisano';
      acc[label] = (acc[label] || 0) + (p.leaseValueKm ?? 0);
      return acc;
    }, {} as Record<string, number>);

    return { 
      total, 
      free, 
      occupied, 
      occupancyRate: Math.round((occupied / total) * 100) || 0,
      expiringSoon,
      expired,
      byDepartment,
      uniqueTraders,
      leasedValue,
      byPositionLabel: Object.entries(byPositionLabel).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
      byPositionType: Object.entries(byPositionType).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    };
  }, [positions]);

  const exportToCSV = () => {
    const headers = ['Broj pozicije', 'Trgovac', 'Naziv', 'Tip', 'Artikal', 'Odjel', 'Zakup do', 'Vrijednost (KM)', 'Status'];
    const rows = positions.map(p => [
      p.positionNumber,
      p.trader || '-',
      p.positionLabel || '-',
      p.positionType || '-',
      p.itemName || '-',
      getDepartmentInfo(p.department).label,
      p.leaseEndDate ? new Date(p.leaseEndDate).toLocaleDateString('hr-HR') : '-',
      p.leaseValueKm ?? 0,
      p.isFree ? 'Slobodno' : 'Zauzeto',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prodajne-pozicije-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Izvještaji i analitika
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Pregled</TabsTrigger>
            <TabsTrigger value="departments">Odjeli</TabsTrigger>
            <TabsTrigger value="expiring">Ističu</TabsTrigger>
            <TabsTrigger value="lease">Zakup</TabsTrigger>
            <TabsTrigger value="all">Sve pozicije</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Ukupno pozicija</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Zauzetost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success">{stats.occupancyRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Slobodnih</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-muted-foreground">{stats.free}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Trgovaca</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{stats.uniqueTraders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Vrijednost zakupa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{stats.leasedValue.toFixed(2)} KM</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Distribucija po odjelima
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.byDepartment.map((dept) => (
                    <div key={dept.value} className="flex items-center gap-3">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `hsl(var(--${dept.color}))` }}
                      />
                      <span className="flex-1 text-sm">{dept.label}</span>
                      <span className="text-sm font-medium">{dept.count}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${dept.percentage}%`,
                            backgroundColor: `hsl(var(--${dept.color}))`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {dept.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stats.byDepartment.map((dept) => (
                <Card key={dept.value}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${dept.color}))` }}
                      />
                      <span className="font-medium">{dept.label}</span>
                    </div>
                    <p className="text-4xl font-bold mb-1">{dept.count}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.percentage}% od ukupno
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expiring" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-warning" />
                  Ističu u narednih 30 dana ({stats.expiringSoon.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.expiringSoon.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nema pozicija koje ističu uskoro.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pozicija</TableHead>
                        <TableHead>Trgovac</TableHead>
                        <TableHead>Odjel</TableHead>
                        <TableHead>Datum isteka</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.expiringSoon.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.positionNumber}</TableCell>
                          <TableCell>{p.trader}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getDepartmentInfo(p.department).label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-warning font-medium">
                            {p.leaseEndDate && new Date(p.leaseEndDate).toLocaleDateString('hr-HR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {stats.expired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                    <Calendar className="w-4 h-4" />
                    Istekli zakupi ({stats.expired.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pozicija</TableHead>
                        <TableHead>Trgovac</TableHead>
                        <TableHead>Odjel</TableHead>
                        <TableHead>Datum isteka</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.expired.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.positionNumber}</TableCell>
                          <TableCell>{p.trader}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getDepartmentInfo(p.department).label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-destructive font-medium">
                            {p.leaseEndDate && new Date(p.leaseEndDate).toLocaleDateString('hr-HR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lease" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Vrijednost po nazivu pozicije
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.byPositionLabel.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nema evidentiranih zakupnih vrijednosti.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.byPositionLabel.map((entry) => (
                      <div key={entry.label} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{entry.label}</span>
                        <span>{entry.value.toFixed(2)} KM</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Vrijednost po tipu pozicije
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.byPositionType.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nema podataka o tipu pozicije.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.byPositionType.map((entry) => (
                      <div key={entry.label} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{entry.label}</span>
                        <span>{entry.value.toFixed(2)} KM</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Izvezi CSV
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pozicija</TableHead>
                      <TableHead>Trgovac</TableHead>
                      <TableHead>Naziv</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Artikal</TableHead>
                      <TableHead>Odjel</TableHead>
                      <TableHead>Zakup do</TableHead>
                      <TableHead>Vrijednost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.positionNumber}</TableCell>
                        <TableCell>{p.trader || '-'}</TableCell>
                        <TableCell>{p.positionLabel || '-'}</TableCell>
                        <TableCell>{p.positionType || '-'}</TableCell>
                        <TableCell>{p.itemName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getDepartmentInfo(p.department).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.leaseEndDate 
                            ? new Date(p.leaseEndDate).toLocaleDateString('hr-HR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{(p.leaseValueKm ?? 0).toFixed(2)} KM</TableCell>
                        <TableCell>
                          <Badge variant={p.isFree ? 'outline' : 'default'}>
                            {p.isFree ? 'Slobodno' : 'Zauzeto'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
