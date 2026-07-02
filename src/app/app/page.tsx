import { ArrowUpRight, KeyRound, Link2 } from 'lucide-react'
import Link from 'next/link'

import { ClickAnalyticsChart } from '@/components/dashboard/analytics-charts'
import { LinksPanel } from '@/components/dashboard/links-panel'
import { Button } from '@/components/ui/button'
import { managedLinks, siteConfig } from '@/lib/site'

export default function DashboardPage() {
    return (
        <>
            <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Overview
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        Create short links, issue API keys, and track clicks for
                        execv.
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline">
                        <Link href="/app/api-keys">
                            <KeyRound className="size-4" />
                            API keys
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/app/links/new">
                            <Link2 className="size-4" />
                            Create link
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <section>
                <ClickAnalyticsChart />
            </section>

            <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Recent links</h2>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/app/links">All links</Link>
                    </Button>
                </div>
                <LinksPanel fallback={managedLinks} />
            </section>
        </>
    )
}
