import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
    title: 'Sign in'
}

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
            <Suspense>
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </Suspense>
        </main>
    )
}
