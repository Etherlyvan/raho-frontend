"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { memberApi } from "@/lib/api/endpoints/members";
import type { MemberLookupResult } from "@/types";

interface Props {
  onSelect: (member: MemberLookupResult) => void;
  placeholder?: string;
  className?: string;
}

export function MemberLookupInput({
  onSelect,
  placeholder = "Cari kode akun pasien...",
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberLookupResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MemberLookupResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (selected) setSelected(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await memberApi.lookup(value.trim());
        setResults(res.data.data ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [selected]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (member: MemberLookupResult) => {
    setSelected(member);
    setQuery(member.memberNo);
    setOpen(false);
    onSelect(member);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-9 pr-9", selected && "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20")}
        />
        {(query || selected) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected preview */}
      {selected && (
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-3 py-2 text-sm">
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              {selected.fullName}
            </span>
            <span className="ml-2 font-mono text-xs text-emerald-600 dark:text-emerald-400">
              {selected.memberNo}
            </span>
            {selected.phone && (
              <span className="ml-2 text-xs text-slate-500">{selected.phone}</span>
            )}
          </div>
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Mencari...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              Pasien tidak ditemukan
            </div>
          ) : (
            <ul className="py-1 max-h-64 overflow-y-auto">
              {results.map((member) => (
                <li key={member.memberId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(member)}
                    className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{member.memberNo}</span>
                        {member.phone && <span className="ml-2">{member.phone}</span>}
                        {/* ← registrationBranch.name, BUKAN member.branchName */}
                        <span className="ml-2 text-slate-400">
                          {member.registrationBranch.name}
                        </span>
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
