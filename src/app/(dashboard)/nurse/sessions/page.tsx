'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { PageHeader } from '@/components/shared/PageHeader';
import { SessionTable } from '@/components/modules/session/SessionTable';
import { Pagination } from '@/components/shared/Pagination';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { sessionApi } from '@/lib/api/endpoints/sessions';
import type { SessionStatus, SessionListParams } from '@/types';

const STATUS_OPTIONS: { label: string; value: SessionStatus | 'ALL' }[] = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Terjadwal',    value: 'PLANNED' },
  { label: 'Berlangsung',  value: 'IN_PROGRESS' },
  { label: 'Selesai',      value: 'COMPLETED' },
  { label: 'Ditunda',      value: 'POSTPONED' },
];

export default function NurseSessionsPage() {
  const user = useAuthStore((s) => s.user);

  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState<SessionStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  const hasFilter = status !== 'ALL' || !!dateFrom || !!dateTo;

  const params: SessionListParams = {
    page,
    limit: 20,
    branchId: user?.branchId ?? undefined,
    ...(status !== 'ALL' && { status }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', 'nurse', params],
    queryFn: async () => {
      const res = await sessionApi.list(params);
      return res.data;
    },
    enabled: !!user?.branchId,
  });

  function handleResetFilter() {
    setStatus('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  return (
    <RoleGuard roles={['NURSE']}>
      <div className="space-y-5">
        <PageHeader
          title="Daftar Sesi Treatment"
          description="Semua sesi treatment di cabang Anda."
        />

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as SessionStatus | 'ALL');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Dari</span>
            <Input
              type="date"
              className="w-38 text-sm"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Sampai</span>
            <Input
              type="date"
              className="w-38 text-sm"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>

          {hasFilter && (
            <Button variant="ghost" size="xs" onClick={handleResetFilter}>
              <X className="h-3 w-3 mr-1" />
              Reset Filter
            </Button>
          )}
        </div>

        {/* Tabel Sesi — reuse SessionTable dari Sprint 4, basePath nurse */}
        <SessionTable
          data={data?.data ?? []}
          isLoading={isLoading}
          basePath="/dashboard/nurse"
        />

        {data?.meta && (
          <Pagination
            meta={data.meta}
            page={page}
            onPageChange={setPage}
          />
        )}
      </div>
    </RoleGuard>
  );
}
