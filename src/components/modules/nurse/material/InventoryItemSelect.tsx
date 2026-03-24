'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { inventoryApi } from '@/lib/api/endpoints/inventory';
import type { InventoryItem, InventoryCategory } from '@/types';

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  MEDICINE:   'Obat',
  DEVICE:     'Alat',
  CONSUMABLE: 'Habis Pakai',
};

const CATEGORY_COLOR: Record<InventoryCategory, string> = {
  MEDICINE:   'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  DEVICE:     'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  CONSUMABLE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface Props {
  branchId: string;
  value: string;                 // inventoryItemId yang terpilih
  onChange: (item: InventoryItem | null) => void;
  disabled?: boolean;
}

/**
 * InventoryItemSelect — Combobox searchable untuk memilih item inventori cabang.
 * Menampilkan nama, kategori, stok saat ini, dan satuan.
 * Item dengan stok = 0 tetap tampil tapi diberi keterangan "Habis".
 */
export function InventoryItemSelect({
  branchId,
  value,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'list', branchId],
    queryFn: async () => {
      const res = await inventoryApi.list({
        branchId,
        isActive: true,
        limit: 100,
      });
      return res.data.data as InventoryItem[];
    },
    enabled: !!branchId,
    staleTime: 60 * 1000, // 1 menit — stok bisa berubah
  });

  const items = data ?? [];
  const selected = items.find((i) => i.inventoryItemId === value) ?? null;

  if (isLoading) {
    return <Skeleton className="h-8 w-full rounded-lg" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-sm h-8"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span className="truncate">{selected.name}</span>
              <Badge
                variant="outline"
                className={`shrink-0 border-0 text-xs h-4 ${CATEGORY_COLOR[selected.category]}`}
              >
                {CATEGORY_LABEL[selected.category]}
              </Badge>
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Cari & pilih item inventori...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari nama item..." />
          <CommandList>
            <CommandEmpty>
              <p className="text-sm text-muted-foreground py-2">
                Item tidak ditemukan.
              </p>
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected   = item.inventoryItemId === value;
                const isOutOfStock = item.stock <= 0;

                return (
                  <CommandItem
                    key={item.inventoryItemId}
                    value={`${item.name} ${item.category}`}
                    onSelect={() => {
                      onChange(isSelected ? null : item);
                      setOpen(false);
                    }}
                    disabled={isOutOfStock}
                    className="flex items-start gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`shrink-0 border-0 text-xs h-4 ${CATEGORY_COLOR[item.category]}`}
                        >
                          {CATEGORY_LABEL[item.category]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs ${
                            isOutOfStock
                              ? 'text-red-500 font-medium'
                              : item.stock <= item.minThreshold
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          Stok: {item.stock} {item.unit}
                        </span>
                        {isOutOfStock && (
                          <span className="text-xs text-red-500 font-medium">
                            · Habis
                          </span>
                        )}
                        {!isOutOfStock && item.stock <= item.minThreshold && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            · Hampir habis
                          </span>
                        )}
                        {item.location && (
                          <span className="text-xs text-muted-foreground">
                            · {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
