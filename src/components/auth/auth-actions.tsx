'use client'

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function AuthNavActions() {
    const { isSignedIn, isLoaded } = useUser()

    return (
        <div className="flex items-center gap-2">
            {isLoaded && !isSignedIn ? (
                <>
                    <SignInButton mode="modal">
                        <Button variant="ghost">Sign in</Button>
                    </SignInButton>
                    <SignUpButton mode="modal" forceRedirectUrl="/app">
                        <Button>Get started</Button>
                    </SignUpButton>
                </>
            ) : null}
            {isSignedIn ? (
                <>
                    <Button asChild>
                        <Link href="/app">Dashboard</Link>
                    </Button>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'size-8'
                            }
                        }}
                    />
                </>
            ) : null}
        </div>
    )
}
