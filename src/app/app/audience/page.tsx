import { MailPlus, ShieldCheck, UsersRound } from "lucide-react";

import { OrganizationMembers } from "@/components/dashboard/organization-members";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { audienceRows } from "@/lib/site";

export const metadata = {
  title: "Audience",
};

export default function AudiencePage() {
  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Approved cohorts and host policies
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep link access narrow by member segment, destination domain, and
            approval workflow.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <UsersRound className="size-5 text-blue-700" />
          <p className="mt-4 text-3xl font-semibold">0</p>
          <p className="mt-1 text-sm text-muted-foreground">Approved members</p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <ShieldCheck className="size-5 text-teal-700" />
          <p className="mt-4 text-3xl font-semibold">0</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Allowlisted hosts
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <MailPlus className="size-5 text-amber-700" />
          <p className="mt-4 text-3xl font-semibold">0</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending invitations
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segment</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Allowed hosts</TableHead>
              <TableHead>Policy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audienceRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                  Audience cohorts will appear after workspace members and link
                  policies are synced.
                </TableCell>
              </TableRow>
            ) : (
              audienceRows.map((row) => (
                <TableRow key={row.segment}>
                  <TableCell className="font-medium">{row.segment}</TableCell>
                  <TableCell>{row.members}</TableCell>
                  <TableCell>{row.allowedDomains}</TableCell>
                  <TableCell>{row.policy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <OrganizationMembers />
    </>
  );
}
