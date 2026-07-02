import Link from 'next/link'

import { siteConfig } from '@/lib/site'
import { Waitlist } from '@clerk/nextjs'

export const metadata = {
    title: 'Waitlist'
}

export default function WaitlistPage() {
    return (
        <main className="min-h-screen bg-muted/30">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
                <Link href="/" className="font-semibold">
                    {siteConfig.name}
                </Link>
            </div>
            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                    <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Wait indefinitely for possible free access.
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                        Joining the waitlist does not guarantee access or a
                        launch date. If we ever release a free tier, waitlist
                        requests may be reviewed then. Currently, you can only
                        gain access by donating at https://ko-fi.com/ariksquad
                        and contacting us at Discord with username @ariksquad.
                    </p>
                </div>
                <Waitlist />
            </section>
        </main>
    )
}
