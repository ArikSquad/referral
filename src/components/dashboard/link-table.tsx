'use client'

import { useMutation } from 'convex/react'
import {
    ArrowUpRight,
    Copy,
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'

import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import type { ManagedLink } from '@/lib/site'
import {
    shortLinkDisplayUrl,
    shortLinkUrl,
    updateShortLinkPayload
} from '@/lib/short-links'
export function LinkTable({
    links,
    compact = false
}: {
    links: ManagedLink[]
    compact?: boolean
}) {
    if (links.length === 0) {
        return (
            <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
                <h3 className="text-base font-semibold">No links yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Create a short link from the dashboard or API to start
                    collecting click events.
                </p>
                <Button asChild className="mt-5">
                    <Link href="/app/links/new" prefetch>
                        Create link
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Link</TableHead>
                        <TableHead>Status</TableHead>
                        {!compact && <TableHead>Clicks</TableHead>}
                        {!compact && <TableHead>Created</TableHead>}
                        <TableHead>Last click</TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {links.map((link) => (
                        <LinkTableRow
                            key={link.id}
                            link={link}
                            compact={compact}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function LinkTableRow({
    link,
    compact
}: {
    link: ManagedLink
    compact: boolean
}) {
    const updateLink = useMutation(api.links.update)
    const removeLink = useMutation(api.links.remove)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [status, setStatus] = useState<'idle' | 'saving' | 'deleting'>('idle')
    const [error, setError] = useState('')
    const [name, setName] = useState(link.name)
    const [slug, setSlug] = useState(link.slug)
    const [destination, setDestination] = useState(link.destination)

    async function copyUrl() {
        await navigator.clipboard.writeText(shortLinkUrl(link.slug))
    }

    async function submitEdit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setStatus('saving')
        setError('')

        try {
            await updateLink({
                linkId: link.id as Id<'links'>,
                ...updateShortLinkPayload({
                    name,
                    slug,
                    destination
                })
            })
            setEditOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Link update failed')
        } finally {
            setStatus('idle')
        }
    }

    async function confirmDelete() {
        setStatus('deleting')
        setError('')

        try {
            await removeLink({ linkId: link.id as Id<'links'> })
            setDeleteOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Link delete failed')
        } finally {
            setStatus('idle')
        }
    }

    return (
        <>
            <TableRow>
                <TableCell>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{link.name}</p>
                            <Button
                                size="icon-xs"
                                variant="ghost"
                                aria-label={`Copy ${link.slug}`}
                                onClick={copyUrl}
                            >
                                <Copy className="size-3" />
                            </Button>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                            {shortLinkDisplayUrl(link.slug)}
                        </p>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="font-medium capitalize">
                        {link.status}
                    </span>
                </TableCell>
                {!compact && (
                    <TableCell className="font-medium">
                        {link.clicks.toLocaleString()}
                    </TableCell>
                )}
                {!compact && (
                    <TableCell>{link.createdVia ?? 'dashboard'}</TableCell>
                )}
                <TableCell>{link.lastClick}</TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`${link.name} actions`}
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/${link.slug}`}
                                    target="_blank"
                                    prefetch={false}
                                >
                                    Open
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => setEditOpen(true)}
                            >
                                Edit
                                <Pencil className="size-4" />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleteOpen(true)}
                            >
                                Delete
                                <Trash2 className="size-4" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <form onSubmit={submitEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit link</DialogTitle>
                            <DialogDescription>
                                Rename the link, change its short path, or point
                                it to a different destination.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-5">
                            <div className="grid gap-2">
                                <Label htmlFor={`name-${link.id}`}>Name</Label>
                                <Input
                                    id={`name-${link.id}`}
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`slug-${link.id}`}>
                                    Short path
                                </Label>
                                <Input
                                    id={`slug-${link.id}`}
                                    value={slug}
                                    onChange={(event) =>
                                        setSlug(event.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    {shortLinkDisplayUrl(slug)}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`destination-${link.id}`}>
                                    Destination URL
                                </Label>
                                <Input
                                    id={`destination-${link.id}`}
                                    type="url"
                                    required
                                    value={destination}
                                    onChange={(event) =>
                                        setDestination(event.target.value)
                                    }
                                />
                            </div>
                            {error ? (
                                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                    {error}
                                </div>
                            ) : null}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={status === 'saving'}
                            >
                                {status === 'saving' ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Pencil className="size-4" />
                                )}
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete link</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes {shortLinkDisplayUrl(link.slug)} and
                            stops future redirects for this short URL.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {error ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={status === 'deleting'}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={status === 'deleting'}
                            onClick={(event) => {
                                event.preventDefault()
                                void confirmDelete()
                            }}
                        >
                            {status === 'deleting' ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Trash2 className="size-4" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
