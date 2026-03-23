import { Construction } from "lucide-react";

interface Props {
  title:       string;
  sprint?:     number;
  description?: string;
}

export function UnderConstruction({ title, sprint, description }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
        <Construction className="h-12 w-12" />
        <p className="text-sm font-medium">Dalam Pengembangan</p>
        {sprint && (
          <p className="text-xs text-slate-400">Tersedia di Sprint {sprint}</p>
        )}
      </div>
    </div>
  );
}
