'use client'

import { useConvexAuth, useQuery } from 'convex/react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis
} from 'recharts'

import { api } from '../../../convex/_generated/api'
import { clickSeries } from '@/lib/site'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from '@/components/ui/chart'

type ClickPoint = {
    day: string
    clicks: number
}

const chartConfig = {
    clicks: {
        label: 'Clicks',
        color: 'var(--chart-1)'
    }
} satisfies ChartConfig

function dateBucket(ts: number) {
    return new Date(ts).toISOString().slice(0, 10)
}

function formatDay(key: string) {
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
    }).format(new Date(key))
}

function groupClicks(clicks: Array<{ ts: number }>): ClickPoint[] {
    const buckets = new Map<string, number>()

    for (const click of clicks) {
        const key = dateBucket(click.ts)
        buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    return [...buckets.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, clicks]) => ({
            day: formatDay(day),
            clicks
        }))
}

export function ClickAnalyticsChart() {
    const hasDataClient = Boolean(
        process.env.NEXT_PUBLIC_CONVEX_URL &&
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    )

    if (!hasDataClient) {
        return <Chart data={clickSeries} />
    }

    return <ConnectedClickAnalyticsChart fallback={clickSeries} />
}

function ConnectedClickAnalyticsChart({
    fallback
}: {
    fallback: ClickPoint[]
}) {
    const auth = useConvexAuth()

    const clicks = useQuery(
        api.clicks.recentMine,
        auth.isAuthenticated ? {} : 'skip'
    )

    if (clicks === undefined) {
        return <Chart data={fallback} muted />
    }

    return <Chart data={groupClicks(clicks)} />
}

function Chart({
    data,
    muted = false
}: {
    data: ClickPoint[]
    muted?: boolean
}) {
    const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Clicks</CardTitle>
                    <CardDescription>
                        Redirect events by day
                    </CardDescription>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">
                        {totalClicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        total clicks
                    </div>
                </div>
            </CardHeader>

            <CardContent className={muted ? 'opacity-60' : undefined}>
                <ChartContainer
                    config={chartConfig}
                    className="h-[260px] w-full"
                >
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            top: 16,
                            right: 12,
                            left: 0,
                            bottom: 0
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="clicksGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-clicks)"
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-clicks)"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={24}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={32}
                            allowDecimals={false}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    labelClassName="font-medium"
                                />
                            }
                        />

                        <Area
                            dataKey="clicks"
                            type="natural"
                            stroke="var(--color-clicks)"
                            strokeWidth={2.5}
                            fill="url(#clicksGradient)"
                            activeDot={{
                                r: 5
                            }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}