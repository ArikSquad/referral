"use client";

import { useMutation } from "convex/react";
import {
  BadgeDollarSign,
  CheckCircle2,
  KeyRound,
  RadioTower,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { api } from "../../../convex/_generated/api";
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
import { Textarea } from "@/components/ui/textarea";
import { affiliateNetworks, affiliateSetupSteps } from "@/lib/site";

const healthItems = [
  { label: "Credentials", value: "Not connected", icon: KeyRound },
  { label: "Webhook", value: "Awaiting endpoint", icon: Webhook },
  { label: "Revenue sync", value: "Not started", icon: RefreshCw },
];

export function AffiliateSetup() {
  const hasDataClient = Boolean(process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL);

  if (!hasDataClient) {
    return <AffiliateSetupShell />;
  }

  return <ConnectedAffiliateSetup />;
}

function ConnectedAffiliateSetup() {
  const saveIntegration = useMutation(api.affiliateIntegrations.save);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("saving");

    try {
      await saveIntegration({
        provider: form.get("provider") as
          | "amazon-associates"
          | "custom-webhook"
          | "partner-network",
        name: String(form.get("integrationName") ?? "Affiliate network"),
        trackingId: optionalString(form.get("trackingId")),
        marketplace: optionalString(form.get("marketplace")),
        hasApiCredentials: Boolean(
          optionalString(form.get("apiKey")) &&
            optionalString(form.get("apiSecret"))
        ),
        webhookUrl: optionalString(form.get("webhookUrl")),
        hasWebhookSecret: Boolean(optionalString(form.get("webhookSecret"))),
        eventMapping: optionalString(form.get("eventMapping")),
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return <AffiliateSetupShell onSubmit={onSubmit} status={status} />;
}

function optionalString(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : undefined;
}

function AffiliateSetupShell({
  onSubmit,
  status = "idle",
}: {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  status?: "idle" | "saving" | "saved" | "error";
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form className="rounded-lg border bg-card p-5 shadow-sm" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              Connect a partner network
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Each workspace connects its own tracking IDs, credentials, and
              revenue events. Nothing here depends on deployment-level secrets.
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BadgeDollarSign className="size-5" />
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Network</Label>
              <Select name="provider" defaultValue="amazon-associates">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {affiliateNetworks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="integrationName">Integration name</Label>
              <Input
                id="integrationName"
                name="integrationName"
                placeholder="US storefront"
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input id="trackingId" name="trackingId" placeholder="yourtag-20" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Input id="marketplace" name="marketplace" placeholder="United States" />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API access key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                placeholder="Paste once to verify"
                type="password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiSecret">API secret key</Label>
              <Input
                id="apiSecret"
                name="apiSecret"
                placeholder="Stored securely"
                type="password"
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_0.8fr]">
            <div className="grid gap-2">
              <Label htmlFor="webhookUrl">Webhook endpoint</Label>
              <Input
                id="webhookUrl"
                name="webhookUrl"
                placeholder="https://partner.example.com/events"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="webhookSecret">Signing secret</Label>
              <Input
                id="webhookSecret"
                name="webhookSecret"
                placeholder="Paste once to verify"
                type="password"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eventMapping">Revenue event mapping</Label>
            <Textarea
              id="eventMapping"
              name="eventMapping"
              placeholder="order.approved -> conversion&#10;commission.paid -> revenue&#10;refund.created -> reversal"
              rows={4}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={status === "saving"}>
            <RadioTower className="size-4" />
            {status === "saving" ? "Saving..." : "Verify connection"}
          </Button>
          <Button type="button" variant="outline">
            Save draft
          </Button>
        </div>
        {status === "saved" ? (
          <p className="mt-3 text-sm text-emerald-700">
            Integration saved. Verification is queued.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 text-sm text-destructive">
            Integration could not be saved. Check your workspace access and try again.
          </p>
        ) : null}
      </form>

      <aside className="grid content-start gap-4">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Setup path</h3>
          <div className="mt-5 grid gap-4">
            {affiliateSetupSteps.map((step, index) => (
              <div key={step.title} className="grid grid-cols-[32px_1fr] gap-3">
                <div className="relative flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {index + 1}
                  {index === 0 ? (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Connection health</h3>
          <div className="mt-4 grid gap-3">
            {healthItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
