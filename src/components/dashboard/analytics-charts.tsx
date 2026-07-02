'use client'

import { useConvexAuth, useQuery } from 'convex/react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

import { api } from '../../../convex/_generated/api'
import { clickSeries } from '@/lib/site'

function dayKey(ts: number) {
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
    }).format(new Date(ts))
}

function groupClicks(clicks: Array<{ ts: number }>) {
    const buckets = new Map<string, number>()

    for (const click of clicks) {
        const key = dayKey(click.ts)
        buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    return [...buckets.entries()]
        .reverse()
        .map(([day, count]) => ({ day, clicks: count }))
}

export function ClickAnalyticsChart() {
    const hasDataClient = Boolean(
        (process.env.NEXT_PUBLIC_CONVEX_URL ||
            process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL) &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    )

    if (!hasDataClient) {
        return <Chart data={clickSeries} />
    }

    return <ConnectedClickAnalyticsChart />
}

function ConnectedClickAnalyticsChart() {
    const auth = useConvexAuth()
    const clicks = useQuery(
        api.clicks.recentMine,
        auth.isAuthenticated ? {} : 'skip'
    )

    if (clicks === undefined) {
        return (
            <div className="flex h-80 flex-col justify-center rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="text-base font-semibold">Clicks</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Loading click events...
                </p>
            </div>
        )
    }

    return <Chart data={groupClicks(clicks)} />
}

function Chart({ data }: { data: Array<{ day: string; clicks: number }> }) {
    if (data.length === 0) {
        return (
            <div className="flex h-80 flex-col justify-center rounded-lg border bg-card p-6 shadow-sm">
                <h2 className="text-base font-semibold">Clicks</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Click charts will populate after a short link receives
                    redirect events.
                </p>
            </div>
        )
    }

    return (
        <div className="h-80 rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-semibold">Clicks</h2>
                <p className="text-sm text-muted-foreground">
                    Redirect events by day.
                </p>
            </div>
            <ResponsiveContainer width="100%" height="78%">
                <AreaChart data={data} margin={{ left: 8, right: 8 }}>
                    <defs>
                        <linearGradient id="clicks" x1="0" x2="0" y1="0" y2="1">
                            <stop
                                offset="0%"
                                stopColor="#111827"
                                stopOpacity={0.28}
                            />
                            <stop
                                offset="100%"
                                stopColor="#111827"
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={52} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: '1px solid hsl(var(--border))'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#111827"
                        fill="url(#clicks)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
