import type { ReactNode } from 'react'
import { Suspense } from 'react'
import Link from 'next/link'

import { AppShell } from '@/components/dashboard/app-shell'
import { getAppAccess } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Hourglass, ShieldX } from 'lucide-react'

export const metadata = {
    title: 'Dashboard'
}

export default function DashboardLayout({
    children
}: {
    children: ReactNode
}) {
    return (
        <Suspense fallback={<DashboardShellSkeleton />}>
            <DashboardAccessGate>{children}</DashboardAccessGate>
        </Suspense>
    )
}

async function DashboardAccessGate({ children }: { children: ReactNode }) {
    const access = await getAppAccess()

    if (access.status !== 'approved') {
        const isRejected = access.status === 'rejected'
        const Icon = isRejected ? ShieldX : Hourglass

        return (
            <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
                <section className="w-full max-w-xl rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">
                                {isRejected
                                    ? 'Access denied'
                                    : 'Access pending'}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {isRejected
                                    ? 'Your request to join the waitlist has been rejected.'
                                    : 'Your request to join the waitlist is being reviewed.'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        {!isRejected ? (
                            <Button asChild variant="secondary">
                                <Link href="/waitlist">More information</Link>
                            </Button>
                        ) : null}
                        <Button asChild variant="outline">
                            <Link href="/">Back to home</Link>
                        </Button>
                    </div>
                </section>
            </main>
        )
    }

    return <AppShell access={access}>{children}</AppShell>
}

function DashboardShellSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
                <div className="flex h-16 items-center gap-3 border-b px-5">
                    <Skeleton className="size-8 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <nav className="grid gap-1 p-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex h-9 items-center gap-3 rounded-md px-3"
                        >
                            <Skeleton className="size-4" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
                    <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-9 rounded-md" />
                            <Skeleton className="size-9 rounded-md" />
                            <Skeleton className="hidden h-9 w-24 rounded-md sm:block" />
                            <Skeleton className="size-8 rounded-full" />
                        </div>
                    </div>
                    <div className="flex gap-1 overflow-x-auto border-t px-2 py-2 lg:hidden">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-8 w-24 rounded-md"
                            />
                        ))}
                    </div>
                </header>
                <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid gap-4 md:grid-cols-3">
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                        <Skeleton className="h-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-80 rounded-lg" />
                </main>
            </div>
        </div>
    )
}
