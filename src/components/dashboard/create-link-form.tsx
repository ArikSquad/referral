"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { Loader2, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function userFacingMutationError(err: unknown) {
  if (!(err instanceof Error)) {
    return "Link could not be created.";
  }

  if (
    err.message.includes("Authentication required") ||
    err.message.includes("Unauthenticated")
  ) {
    return "Sign in to create links.";
  }

  if (err.message.includes("Approved account required")) {
    return "A paid account is required to create links.";
  }

  return err.message;
}

export function CreateLinkForm() {
  const hasDataClient = Boolean(
    (process.env.NEXT_PUBLIC_CONVEX_URL ||
      process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL) &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  );

  if (!hasDataClient) {
    return (
      <CreateLinkShell disabledReason="Configure Convex and Clerk to create live links." />
    );
  }

  return <ConnectedCreateLinkForm />;
}

function ConnectedCreateLinkForm() {
  const auth = useConvexAuth();
  const createLink = useMutation(api.links.create);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(payload: {
    name?: string;
    slug?: string;
    destination: string;
  }) {
    if (!auth.isAuthenticated) {
      setError("Sign in to create links.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setError("");

    try {
      await createLink(payload);
      router.push("/app/links");
      router.refresh();
    } catch (err) {
      setError(userFacingMutationError(err));
      setStatus("error");
    }
  }

  return (
    <CreateLinkShell
      onSubmit={onSubmit}
      status={status}
      error={error}
      disabledReason={
        auth.isLoading
          ? "Checking sign-in status."
          : auth.isAuthenticated
            ? undefined
            : "Sign in to create links."
      }
    />
  );
}

function CreateLinkShell({
  onSubmit,
  status = "idle",
  error,
  disabledReason,
}: {
  onSubmit?: (payload: {
    name?: string;
    slug?: string;
    destination: string;
  }) => Promise<void>;
  status?: "idle" | "saving" | "error";
  error?: string;
  disabledReason?: string;
}) {
  const [destination, setDestination] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const normalizedSlug = slugify(slug);
  const shortUrl = `https://${siteConfig.shortDomain}/${normalizedSlug || "abc1234"}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabledReason) {
      return;
    }

    await onSubmit({
      destination: destination.trim(),
      name: name.trim() || undefined,
      slug: normalizedSlug || undefined,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form className="rounded-lg border bg-card shadow-sm" onSubmit={submit}>
        <div className="border-b p-5">
          <h1 className="text-2xl font-semibold tracking-tight">Create link</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create a short URL that redirects immediately and starts recording clicks.
          </p>
        </div>

        <div className="grid gap-5 p-5">
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination URL</Label>
            <Input
              id="destination"
              type="url"
              required
              placeholder="https://docs.example.com/getting-started"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Docs quickstart"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!slug) {
                  setSlug(slugify(event.target.value));
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Custom slug</Label>
            <Input
              id="slug"
              placeholder="docs"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{shortUrl}</p>
          </div>

          {disabledReason ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              {disabledReason}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={Boolean(disabledReason) || status === "saving"}
            className="w-fit"
          >
            {status === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            Create short link
          </Button>
        </div>
      </form>

      <aside className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold">API equivalent</h2>
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6">
          <code>{`await fetch("${siteConfig.url}/api/links", {
  method: "POST",
  headers: {
    "authorization": "Bearer exv_...",
    "content-type": "application/json"
  },
  body: JSON.stringify({
    destination: "${destination || "https://example.com"}",
    slug: "${normalizedSlug || "docs"}"
  })
});`}</code>
        </pre>
      </aside>
    </div>
  );
}
