"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@/types";

type KpiCardProps = KpiMetric & {
  icon?: React.ReactNode;
  className?: string;
};

const trendBadgeClass = {
  up: "bg-emerald-600/10 text-emerald-600 border-none",
  down: "bg-rose-600/10 text-rose-600 border-none",
  neutral: "bg-zinc-100 text-zinc-500 border-none dark:bg-white/5 dark:text-zinc-400",
};

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group bg-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            {title}
          </CardTitle>
          {icon && (
            <div className="size-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 transition-colors border border-zinc-100 dark:border-white/5">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">{value}</p>
        {subtitle && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mt-1">{subtitle}</p>
        )}
      </CardContent>
      {trend && trendValue && (
        <CardFooter className="pt-0 pb-4">
          <Badge
            className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 tracking-tight",
              trendBadgeClass[trend]
            )}
            variant="secondary"
          >
            {trend === "up" && "↑ "}
            {trend === "down" && "↓ "}
            {trendValue}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
