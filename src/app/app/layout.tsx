import type { ReactNode } from 'react'

import { AppShell } from '@/components/dashboard/app-shell'
import { getAppAccess } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Hourglass, Link, ShieldX } from 'lucide-react'

export const metadata = {
    title: 'Dashboard'
}

export default async function DashboardLayout({
    children
}: {
    children: ReactNode
}) {
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
