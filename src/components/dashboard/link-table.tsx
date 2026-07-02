import { ArrowUpRight, Copy, MoreHorizontal, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { ManagedLink } from "@/lib/site";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusTone = {
  live: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  review: "bg-amber-50 text-amber-700 ring-amber-600/15",
  paused: "bg-blue-50 text-blue-700 ring-blue-600/15",
  blocked: "bg-red-50 text-red-700 ring-red-600/15",
};

export function LinkTable({
  links,
  compact = false,
}: {
  links: ManagedLink[];
  compact?: boolean;
}) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <h3 className="text-base font-semibold">No links yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Create your first governed referral link to start collecting redirect
          events, country decisions, and affiliate status.
        </p>
        <Button asChild className="mt-5">
          <Link href="/app/links/new">Create link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Link</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Policy</TableHead>
            {!compact && <TableHead>Clicks</TableHead>}
            {!compact && <TableHead>Revenue</TableHead>}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{link.name}</p>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Copy ${link.slug}`}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {siteConfig.shortDomain}/{link.slug}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ring-1",
                    statusTone[link.status]
                  )}
                >
                  {link.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-teal-700" />
                  <span className="text-sm">{link.mode}</span>
                  <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                    {link.allowCountries?.length
                      ? `${link.allowCountries.length} countries`
                      : "Global"}
                  </span>
                  {link.accessKeyRequired ? (
                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                      Access key
                    </span>
                  ) : null}
                </div>
              </TableCell>
              {!compact && (
                <TableCell className="font-medium">
                  {link.clicks.toLocaleString()}
                </TableCell>
              )}
              {!compact && <TableCell>{link.revenue}</TableCell>}
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
                      <Link href={`/${link.slug}`} target="_blank">
                        Open redirect
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Review events</DropdownMenuItem>
                    <DropdownMenuItem>Pause link</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
