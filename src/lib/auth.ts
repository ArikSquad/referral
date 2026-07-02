import 'server-only'

import { auth, currentUser } from '@clerk/nextjs/server'
import { cacheLife } from 'next/cache'
import { redirect } from 'next/navigation'

export type AppAccess = {
    mode: 'clerk'
    status: 'approved' | 'pending-approval' | 'rejected'
    userName: string
}

export async function getAppAccess(): Promise<AppAccess> {
    'use cache: private'
    cacheLife({ stale: 60 })

    const session = await auth()

    if (!session.userId) {
        redirect('/sign-in?redirect_url=/app')
    }

    const user = await currentUser()
    const userName = user?.firstName ?? user?.username ?? 'Approved member'
    const approvalStatus = user?.publicMetadata.approvalStatus as
        'approved' | 'pending-approval' | 'rejected'

    return {
        mode: 'clerk',
        status: approvalStatus,
        userName
    }
}
