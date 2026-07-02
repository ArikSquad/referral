import 'server-only'

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type AppAccess = {
    mode: 'clerk'
    status: 'active' | 'pending-approval' | 'rejected'
    userName: string
}

type HasEntitlement = (params: { plan?: string; feature?: string }) => boolean

export async function getAppAccess(): Promise<AppAccess> {
    const session = await auth()

    if (!session.userId) {
        redirect('/sign-in?redirect_url=/app')
    }

    const user = await currentUser()
    const userName = user?.firstName ?? user?.username ?? 'Approved member'
    const approvalStatus = user?.publicMetadata.approvalStatus

    if (approvalStatus === 'rejected') {
        return {
            mode: 'clerk',
            status: 'rejected',
            userName
        }
    }

    const has = session.has as HasEntitlement
    const hasPaidPlan = has({ feature: 'links:manage' })

    if (approvalStatus === 'approved' && hasPaidPlan) {
        return {
            mode: 'clerk',
            status: 'active',
            userName
        }
    }

    return {
        mode: 'clerk',
        status: 'pending-approval',
        userName
    }
}
