import Link from "next/link";

import { LinkTable } from "@/components/dashboard/link-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { managedLinks } from "@/lib/site";

export const metadata = {
  title: "Links",
};

export default function LinksPage() {
  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Managed short links
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Referral, campaign, internal, and private links with approval and
            allowlist rules attached.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/links/new">New link</Link>
        </Button>
      </section>
      <LinkTable links={managedLinks} />
    </>
  );
}
