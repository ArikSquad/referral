import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
    title: 'Request access'
}

export default function SignUpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
            <Suspense>
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </Suspense>
        </main>
    )
}
