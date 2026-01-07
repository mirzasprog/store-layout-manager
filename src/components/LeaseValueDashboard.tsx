import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StoreLeaseTotal, PositionLabelTotal } from '@/hooks/useLeaseTotals';

interface LeaseValueDashboardProps {
  currentStoreName: string;
  currentStoreValue: number;
  currentStoreLeasedCount: number;
  totalValue: number;
  storeTotals: StoreLeaseTotal[];
  labelTotals: PositionLabelTotal[];
  loading?: boolean;
}

const formatKm = (value: number) =>
  new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM' }).format(value);

export function LeaseValueDashboard({
  currentStoreName,
  currentStoreValue,
  currentStoreLeasedCount,
  totalValue,
  storeTotals,
  labelTotals,
  loading = false,
}: LeaseValueDashboardProps) {
  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Zakup ({currentStoreName})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {formatKm(currentStoreValue)}
            </p>
            <p className="text-sm text-muted-foreground">{currentStoreLeasedCount} zakupljenih pozicija</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Zakup (sve prodavnice)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatKm(totalValue)}</p>
            <p className="text-sm text-muted-foreground">Ukupno zakupljeno u mreži</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Vrijednost po prodavnici</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prodavnica</TableHead>
                  <TableHead>Zakupljeno</TableHead>
                  <TableHead className="text-right">Vrijednost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeTotals.map((store) => (
                  <TableRow key={store.storeId}>
                    <TableCell className="font-medium">{store.storeName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{store.leasedCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatKm(store.leasedValue)}</TableCell>
                  </TableRow>
                ))}
                {storeTotals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                      {loading ? 'Učitavanje...' : 'Nema zakupljenih pozicija.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Vrijednost po nazivu pozicije</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv pozicije</TableHead>
                  <TableHead>Zakupljeno</TableHead>
                  <TableHead className="text-right">Vrijednost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labelTotals.slice(0, 8).map((entry) => (
                  <TableRow key={entry.label}>
                    <TableCell className="font-medium">{entry.label}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.leasedCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatKm(entry.leasedValue)}</TableCell>
                  </TableRow>
                ))}
                {labelTotals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">
                      {loading ? 'Učitavanje...' : 'Nema podataka o nazivu pozicije.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {labelTotals.length > 8 && (
              <div className="text-xs text-muted-foreground px-4 py-2">
                Prikazano prvih 8 naziva po vrijednosti.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
