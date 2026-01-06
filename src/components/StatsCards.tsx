import { MapPin, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  total: number;
  occupied: number;
  free: number;
  expiringSoon: number;
}

export function StatsCards({ total, occupied, free, expiringSoon }: StatsCardsProps) {
  const stats = [
    {
      label: 'Ukupno pozicija',
      value: total,
      icon: MapPin,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Zauzeto',
      value: occupied,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Slobodno',
      value: free,
      icon: AlertCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Ističe uskoro',
      value: expiringSoon,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
