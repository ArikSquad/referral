import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneClasses = {
  teal: "bg-teal-50 text-teal-700 ring-teal-600/15",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
  red: "bg-red-50 text-red-700 ring-red-600/15",
};

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg ring-1",
            toneClasses[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
        <span className="text-sm font-medium text-emerald-700">{change}</span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
