import { Link2, LockKeyhole, Sparkles } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function CreateLinkForm() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create governed link
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Generate a clean short URL with destination allowlists, manual
              review, and conversion tracking attached from the start.
            </p>
          </div>
          <Badge variant="secondary">Whitelist default</Badge>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Link name</Label>
            <Input id="name" placeholder="Partner launch - July" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Short suburl</Label>
            <div className="flex overflow-hidden rounded-lg border bg-background">
              <span className="flex items-center border-r bg-muted px-3 text-sm text-muted-foreground">
                {siteConfig.shortDomain}/
              </span>
              <Input
                id="slug"
                className="border-0 shadow-none focus-visible:ring-0"
                placeholder="partner-july"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination URL</Label>
            <Input
              id="destination"
              placeholder="https://example.com/partner/july"
              type="url"
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Link type</Label>
              <Select defaultValue="referral">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="whitelist">Whitelist only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="allowlist">Allowed destination hosts</Label>
            <Textarea
              id="allowlist"
              placeholder="example.com&#10;stripe.com&#10;cal.com"
              rows={5}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="allowCountries">Allowed countries</Label>
              <Input id="allowCountries" placeholder="US, CA, GB" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blockedCountries">Blocked countries</Label>
              <Input id="blockedCountries" placeholder="RU, KP" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessKey">Access key</Label>
            <Input
              id="accessKey"
              placeholder="Optional key required as ?key=..."
              type="password"
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Affiliate integration</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not connected</SelectItem>
                  <SelectItem value="amazon-associates">
                    Amazon Associates draft
                  </SelectItem>
                  <SelectItem value="custom">Custom network</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button">
            <Sparkles className="size-4" />
            Generate link
          </Button>
          <Button type="button" variant="outline">
            Save for review
          </Button>
        </div>
      </form>

      <aside className="grid content-start gap-4">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-600/15">
            <Link2 className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Short URL preview</h2>
          <p className="mt-2 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
            https://{siteConfig.shortDomain}/partner-july
          </p>
        </div>
      </aside>
    </div>
  );
}
