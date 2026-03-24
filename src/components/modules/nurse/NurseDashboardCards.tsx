'use client';

import { Calendar, Activity, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { NurseDashboard } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  iconClass: string;
  isLoading: boolean;
}

function StatCard({ title, value, icon: Icon, description, iconClass, isLoading }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between text-slate-600 dark:text-slate-400">
          {title}
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}

interface Props {
  data: NurseDashboard | null;
  isLoading: boolean;
}

export function NurseDashboardCards({ data, isLoading }: Props) {
  const cards: Omit<StatCardProps, 'isLoading'>[] = [
    {
      title: 'Sesi Hari Ini',
      value: data?.summary.todaySessions ?? 0,
      icon: Calendar,
      description: 'Total sesi terjadwal hari ini',
      iconClass: 'text-teal-500',
    },
    {
      title: 'Sedang Berjalan',
      value: data?.summary.inProgressSessions ?? 0,
      icon: Activity,
      description: 'Sesi berstatus INPROGRESS',
      iconClass: 'text-emerald-500',
    },
    {
      title: 'Stok Kritis',
      value: data?.summary.criticalStockCount ?? 0,
      icon: AlertTriangle,
      description: 'Item di bawah minimum threshold',
      iconClass: 'text-red-500',
    },
    {
      title: 'Permintaan Stok',
      value: data?.summary.pendingStockRequests ?? 0,
      icon: ShoppingCart,
      description: 'Stock request belum ditindaklanjuti',
      iconClass: 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
