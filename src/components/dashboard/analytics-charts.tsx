"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { clickSeries, sourceSeries } from "@/lib/site";

export function ClickAnalyticsChart() {
  if (clickSeries.length === 0) {
    return (
      <div className="flex h-80 flex-col justify-center rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Verified traffic</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Traffic charts will populate after a live link receives redirect
          events.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold">Verified traffic</h2>
        <p className="text-sm text-muted-foreground">
          Clicks, conversions, and blocked attempts by day.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <AreaChart data={clickSeries} margin={{ left: 8, right: 8 }}>
          <defs>
            <linearGradient id="clicks" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={52} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#0f766e"
            fill="url(#clicks)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#2563eb"
            fill="transparent"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="blocked"
            stroke="#dc2626"
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceQualityChart() {
  if (sourceSeries.length === 0) {
    return (
      <div className="flex h-80 flex-col justify-center rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">Source quality</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Affiliate and conversion source quality appears after partner network
          status is connected.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold">Source quality</h2>
        <p className="text-sm text-muted-foreground">
          Share of approved conversion sources.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={sourceSeries} layout="vertical" margin={{ left: 18 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="source"
            tickLine={false}
            axisLine={false}
            width={118}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
