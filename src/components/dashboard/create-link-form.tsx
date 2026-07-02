"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  CalendarDays,
  Check,
  GalleryHorizontalEnd,
  Globe2,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { affiliateNetworks, siteConfig, type LinkMode } from "@/lib/site";
import { cn } from "@/lib/utils";

type Country = {
  code: string;
  name: string;
};

const countries: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
  { code: "ZA", name: "South Africa" },
];

const linkModes: Array<{ value: LinkMode; label: string; body: string }> = [
  {
    value: "Referral",
    label: "Referral",
    body: "Partner or customer referral with attribution.",
  },
  {
    value: "Campaign",
    label: "Campaign",
    body: "Marketing traffic with UTM enrichment.",
  },
  {
    value: "Whitelist",
    label: "Whitelist",
    body: "Strict destination and country policy.",
  },
  {
    value: "Internal",
    label: "Internal",
    body: "Team-only redirect with optional access key.",
  },
];

const providerById = new Map<string, (typeof affiliateNetworks)[number]>(
  affiliateNetworks.map((network) => [network.id, network])
);

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function optionalDateToMs(value: string, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const suffix = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  return new Date(`${value}${suffix}`).getTime();
}

function splitLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function buildTrackedPreview(destination: string, mode: LinkMode, slug: string, name: string) {
  try {
    const url = new URL(destination);
    const defaults = {
      utm_source: "execv",
      utm_medium: mode.toLowerCase(),
      utm_campaign: slug || "new-link",
      utm_content: name || "link",
    };

    for (const [key, value] of Object.entries(defaults)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }

    return url.toString();
  } catch {
    return destination;
  }
}

function CountrySelect({
  label,
  value,
  onChange,
  excluded = [],
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  excluded?: string[];
}) {
  const [selected, setSelected] = useState("");
  const selectedCountries = countries.filter((country) => value.includes(country.code));
  const available = countries.filter(
    (country) => !value.includes(country.code) && !excluded.includes(country.code)
  );

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select
        value={selected}
        onValueChange={(countryCode) => {
          onChange([...value, countryCode]);
          setSelected("");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Add country" />
        </SelectTrigger>
        <SelectContent position="popper">
          {available.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} ({country.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCountries.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCountries.map((country) => (
            <Badge key={country.code} variant="outline" className="gap-1">
              {country.name}
              <button
                type="button"
                aria-label={`Remove ${country.name}`}
                onClick={() => onChange(value.filter((code) => code !== country.code))}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No country rule selected.</p>
      )}
    </div>
  );
}

export function CreateLinkForm() {
  const hasDataClient = Boolean(
    process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  if (!hasDataClient) {
    return <CreateLinkShell disabledReason="Configure Convex and Clerk to create live links." />;
  }

  return <ConnectedCreateLinkForm />;
}

function ConnectedCreateLinkForm() {
  const auth = useConvexAuth();
  const createLink = useMutation(api.links.create);
  const createCollection = useMutation(api.collections.create);
  const capabilities = useQuery(
    api.links.capabilities,
    auth.isAuthenticated ? {} : "skip"
  );
  const integrations =
    useQuery(
      api.affiliateIntegrations.listMine,
      auth.isAuthenticated ? {} : "skip"
    ) ?? [];
  const existingLinks =
    useQuery(api.links.listMine, auth.isAuthenticated ? {} : "skip") ?? [];
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(payload: LinkPayload) {
    setStatus("saving");
    setError("");

    try {
      await createLink(payload);
      router.push("/app/links");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Link could not be created.");
      setStatus("error");
    }
  }

  async function onCreateCollection(payload: CollectionPayload) {
    setStatus("saving");
    setError("");

    try {
      await createCollection(payload);
      router.push("/app/links");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Collection could not be created.");
      setStatus("error");
    }
  }

  return (
    <CreateLinkShell
      canChooseSlug={capabilities?.canChooseSlug === true}
      integrations={integrations.map((integration) => ({
        id: integration._id,
        name: integration.name,
        provider: integration.provider,
        trackingId: integration.trackingId,
      }))}
      existingLinks={existingLinks.map((link) => ({
        id: link._id,
        name: link.name,
        slug: link.slug,
        destination: link.destination,
        mode: link.mode,
        status: link.status,
      }))}
      onSubmit={onSubmit}
      onCreateCollection={onCreateCollection}
      status={status}
      error={error}
    />
  );
}

type LinkPayload = {
  name: string;
  slug?: string;
  destination: string;
  mode: LinkMode;
  allowlist: string[];
  allowCountries?: string[];
  blockedCountries?: string[];
  accessKey?: string;
  affiliateIntegrationId?: Id<"affiliateIntegrations">;
  affiliateNetwork?: string;
  affiliateAccountId?: string;
  startsAt?: number;
  expiresAt?: number;
};

type CollectionItemPayload = {
  linkId?: Id<"links">;
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  merchant?: string;
  metadataStatus: "enriched" | "basic" | "failed";
};

type CollectionPayload = {
  name: string;
  description?: string;
  items: CollectionItemPayload[];
};

function CreateLinkShell({
  canChooseSlug = false,
  integrations = [],
  existingLinks = [],
  onSubmit,
  onCreateCollection,
  status = "idle",
  error,
  disabledReason,
}: {
  canChooseSlug?: boolean;
  integrations?: Array<{
    id: Id<"affiliateIntegrations">;
    name: string;
    provider: string;
    trackingId?: string;
  }>;
  existingLinks?: Array<{
    id: Id<"links">;
    name: string;
    slug: string;
    destination: string;
    mode: LinkMode;
    status: "review" | "live" | "paused" | "blocked";
  }>;
  onSubmit?: (payload: LinkPayload) => Promise<void>;
  onCreateCollection?: (payload: CollectionPayload) => Promise<void>;
  status?: "idle" | "saving" | "error";
  error?: string;
  disabledReason?: string;
}) {
  const [createMode, setCreateMode] = useState<"link" | "collection">("link");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<LinkMode>("Referral");
  const [allowlist, setAllowlist] = useState("");
  const [allowCountries, setAllowCountries] = useState<string[]>([]);
  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);
  const [accessKeyEnabled, setAccessKeyEnabled] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [integrationId, setIntegrationId] = useState<Id<"affiliateIntegrations"> | "none">("none");
  const [provider, setProvider] = useState("custom-webhook");
  const [affiliateAccountId, setAffiliateAccountId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [manualProvider, setManualProvider] = useState(false);
  const [collectionText, setCollectionText] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionItems, setCollectionItems] = useState<CollectionItemPayload[]>([]);
  const [selectedCollectionLinkIds, setSelectedCollectionLinkIds] = useState<
    Array<Id<"links">>
  >([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const normalizedSlug = slugify(slug);
  const selectedIntegration = integrations.find((integration) => integration.id === integrationId);
  const selectedProvider = selectedIntegration?.provider ?? provider;
  const providerMeta = providerById.get(selectedProvider);
  const isAffiliateLink = integrationId !== "none" || manualProvider;
  const shortUrl = canChooseSlug
    ? `https://${siteConfig.shortDomain}/${normalizedSlug || "your-link"}`
    : `https://${siteConfig.shortDomain}/random-id`;
  const trackedPreview = isAffiliateLink
    ? destination
    : buildTrackedPreview(destination, mode, normalizedSlug, name);
  const allowlistHosts = useMemo(() => splitLines(allowlist), [allowlist]);

  function updateName(value: string) {
    setName(value);

    if (canChooseSlug && autoSlug) {
      setSlug(slugify(value));
    }
  }

  async function importCollectionItems() {
    const urls = splitLines(collectionText);

    setImportError("");

    if (!urls.length) {
      setImportError("Paste at least one URL.");
      return;
    }

    setImporting(true);

    try {
      const results = await Promise.all(
        urls.map(async (url) => {
          const response = await fetch("/app/api/link-metadata", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ url }),
          });

          if (!response.ok) {
            return {
              url,
              title: hostLabel(url),
              metadataStatus: "failed" as const,
            };
          }

          return (await response.json()) as CollectionItemPayload;
        })
      );

      setCollectionItems(results);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Links could not be imported."
      );
    } finally {
      setImporting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createMode === "collection") {
      if (!onCreateCollection) {
        return;
      }

      const items =
        collectionItems.length > 0
          ? collectionItems
          : splitLines(collectionText).map((url) => ({
              url,
              title: hostLabel(url),
              metadataStatus: "basic" as const,
            }));
      const linkedItems = selectedCollectionLinkIds
        .map((linkId) => existingLinks.find((link) => link.id === linkId))
        .filter((link): link is NonNullable<typeof link> => Boolean(link))
        .map((link) => ({
          linkId: link.id,
          url: link.destination,
          title: link.name,
          description: `${siteConfig.shortDomain}/${link.slug}`,
          merchant: link.mode,
          metadataStatus: "basic" as const,
        }));

      await onCreateCollection({
        name: name.trim(),
        description: collectionDescription.trim() || undefined,
        items: [...linkedItems, ...items],
      });
      return;
    }

    if (!onSubmit) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      slug: canChooseSlug ? normalizedSlug : undefined,
      destination: destination.trim(),
      mode,
      allowlist: allowlistHosts,
      allowCountries,
      blockedCountries,
      accessKey: accessKeyEnabled ? accessKey.trim() || undefined : undefined,
      affiliateIntegrationId: integrationId === "none" ? undefined : integrationId,
      affiliateNetwork:
        integrationId === "none" && manualProvider ? selectedProvider : undefined,
      affiliateAccountId:
        integrationId === "none" && manualProvider
          ? affiliateAccountId.trim() || undefined
          : undefined,
      startsAt: optionalDateToMs(startsAt),
      expiresAt: optionalDateToMs(expiresAt, true),
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form className="rounded-lg border bg-card shadow-sm" onSubmit={submit}>
        <div className="border-b p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create link</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Build a governed redirect with UTM defaults, affiliate attribution,
                countries, schedule, and destination rules.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5">
          <section className="grid gap-3">
            <Label>Create</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCreateMode("link")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  createMode === "link" ? "border-primary bg-primary/5" : "hover:bg-muted/60"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="size-4" />
                  Single redirect
                </span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                  One short URL that sends visitors to one destination.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("collection")}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  createMode === "collection"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/60"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <GalleryHorizontalEnd className="size-4" />
                  Collection page
                </span>
                <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                  One short URL that shows several links with imported product details.
                </span>
              </button>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Destination</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Link name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="Partner launch - July"
                  required
                />
              </div>
              {createMode === "link" && canChooseSlug ? (
                <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="slug">Short slug</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={autoSlug}
                      onCheckedChange={(checked) => setAutoSlug(checked === true)}
                    />
                    Auto
                  </label>
                </div>
                <div className="flex overflow-hidden rounded-lg border bg-background">
                  <span className="flex items-center border-r bg-muted px-3 text-sm text-muted-foreground">
                    {siteConfig.shortDomain}/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(event) => {
                      setAutoSlug(false);
                      setSlug(event.target.value);
                    }}
                    className="border-0 shadow-none focus-visible:ring-0"
                    placeholder="partner-july"
                    required
                  />
                </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label>Short slug</Label>
                  <div className="flex min-h-10 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                    {createMode === "collection"
                      ? "Collections receive a short random slug."
                      : "Your short slug is generated automatically."}
                  </div>
                </div>
              )}
            </div>
            {createMode === "link" ? (
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination URL</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="https://example.com/partner/july"
                  type="url"
                  required
                />
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="collectionDescription">Collection description</Label>
                  <Textarea
                    id="collectionDescription"
                    value={collectionDescription}
                    onChange={(event) => setCollectionDescription(event.target.value)}
                    placeholder="Optional context for this collection."
                    rows={2}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Existing referral links</Label>
                    <span className="text-xs text-muted-foreground">
                      {selectedCollectionLinkIds.length} selected
                    </span>
                  </div>
                  {existingLinks.length > 0 ? (
                    <div className="grid max-h-64 gap-2 overflow-auto rounded-lg border p-2">
                      {existingLinks.map((link) => {
                        const checked = selectedCollectionLinkIds.includes(link.id);

                        return (
                          <label
                            key={link.id}
                            className={cn(
                              "grid grid-cols-[auto_1fr] gap-3 rounded-md p-2 text-sm transition-colors",
                              checked ? "bg-muted" : "hover:bg-muted/60"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                setSelectedCollectionLinkIds((current) =>
                                  value === true
                                    ? [...current, link.id]
                                    : current.filter((id) => id !== link.id)
                                )
                              }
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-medium">
                                {link.name}
                              </span>
                              <span className="mt-1 block truncate text-xs text-muted-foreground">
                                {siteConfig.shortDomain}/{link.slug} - {link.mode}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      Existing links will appear here after you create them.
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="collectionLinks">Links to import</Label>
                  <Textarea
                    id="collectionLinks"
                    value={collectionText}
                    onChange={(event) => setCollectionText(event.target.value)}
                    placeholder="https://store.example/product-1&#10;https://store.example/product-2"
                    rows={7}
                    required={
                      collectionItems.length === 0 &&
                      selectedCollectionLinkIds.length === 0
                    }
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Paste one URL per line or comma-separated. Product pages use available metadata.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={importCollectionItems}
                      disabled={importing}
                    >
                      {importing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                      Import metadata
                    </Button>
                  </div>
                  {importError ? (
                    <p className="text-xs text-destructive">{importError}</p>
                  ) : null}
                </div>
                {collectionItems.length > 0 ? (
                  <div className="grid gap-3">
                    {collectionItems.map((item) => (
                      <div key={item.url} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[72px_1fr]">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="aspect-square w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {item.description ?? item.url}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.price ? <Badge variant="outline">{item.price}</Badge> : null}
                            <Badge variant="outline">{item.metadataStatus}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {createMode === "link" ? (
            <>
          <Separator />

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Policy</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {linkModes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    mode === item.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/60"
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {item.label}
                    {mode === item.value ? <Check className="size-4" /> : null}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    {item.body}
                  </span>
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allowlist">Allowed destination hosts</Label>
              <Textarea
                id="allowlist"
                value={allowlist}
                onChange={(event) => setAllowlist(event.target.value)}
                placeholder="example.com&#10;stripe.com&#10;cal.com"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to allow the primary destination host only.
              </p>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Countries</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <CountrySelect
                label="Allowed countries"
                value={allowCountries}
                onChange={setAllowCountries}
                excluded={blockedCountries}
              />
              <CountrySelect
                label="Blocked countries"
                value={blockedCountries}
                onChange={setBlockedCountries}
                excluded={allowCountries}
              />
            </div>
          </section>
            </>
          ) : null}

          <Separator />

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Schedule</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startsAt">Start date</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expiration date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </div>
            </div>
          </section>

          <Separator />

          <section className="grid gap-4">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">Attribution and access</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Affiliate integration</Label>
                <Select
                  value={integrationId}
                  onValueChange={(value) =>
                    setIntegrationId(value as Id<"affiliateIntegrations"> | "none")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="none">No saved integration</SelectItem>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Manual provider</Label>
                <div className="flex h-8 items-center justify-between rounded-lg border px-3">
                  <span className="text-sm text-muted-foreground">
                    Attach provider without saved credentials
                  </span>
                  <Switch
                    checked={manualProvider}
                    onCheckedChange={setManualProvider}
                    disabled={integrationId !== "none"}
                  />
                </div>
              </div>
            </div>
            {integrationId === "none" && manualProvider ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {affiliateNetworks.map((network) => (
                        <SelectItem key={network.id} value={network.id}>
                          {network.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="affiliateAccountId">Tracking or account ID</Label>
                  <Input
                    id="affiliateAccountId"
                    value={affiliateAccountId}
                    onChange={(event) => setAffiliateAccountId(event.target.value)}
                    placeholder="publisher-123 / campaign-abc"
                  />
                </div>
              </div>
            ) : null}
            <div className="grid gap-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="accessKey">Require access key</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Visitors must include ?key=... to pass the redirect.
                  </p>
                </div>
                <Switch checked={accessKeyEnabled} onCheckedChange={setAccessKeyEnabled} />
              </div>
              {accessKeyEnabled ? (
                <Input
                  id="accessKey"
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  placeholder="private-launch-key"
                  type="password"
                  required
                />
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-sm">
            {disabledReason ? (
              <span className="text-muted-foreground">{disabledReason}</span>
            ) : error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">
                New links save for review before going live.
              </span>
            )}
          </div>
          <Button type="submit" disabled={Boolean(disabledReason) || status === "saving"}>
            {status === "saving" ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {createMode === "collection" ? "Create collection" : "Create link"}
          </Button>
        </div>
      </form>

      <aside className="grid content-start gap-4">
        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Preview</h2>
            <Badge variant="outline">{mode}</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Short URL</p>
              <p className="mt-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {shortUrl}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Final destination
              </p>
              <p className="mt-1 max-h-32 overflow-auto break-all rounded-md bg-muted px-3 py-2 font-mono text-xs leading-5">
                {trackedPreview || "Enter a destination URL"}
              </p>
            </div>
          </div>
          {!isAffiliateLink ? (
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm">
              <p className="font-medium">Automatic tracking</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Missing utm_source, utm_medium, utm_campaign, and utm_content values
                are added when the link is saved.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border bg-background p-3 text-sm">
              <p className="font-medium">
                {providerMeta?.name ?? selectedProvider}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Affiliate links keep their destination query intact so provider
                attribution is not overwritten.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Rules</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Hosts</span>
              <Badge variant="outline">
                {allowlistHosts.length ? allowlistHosts.length : "Destination only"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Countries</span>
              <Badge variant="outline">
                {allowCountries.length || blockedCountries.length
                  ? `${allowCountries.length} allow / ${blockedCountries.length} block`
                  : "Global"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Schedule</span>
              <Badge variant="outline">
                {startsAt || expiresAt ? "Timed" : "Always"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Access</span>
              <Badge variant="outline">
                {accessKeyEnabled ? "Key required" : "Open"}
              </Badge>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
