"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { KeyRound, Loader2, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/lib/site";

export function ApiKeysPanel() {
  const auth = useConvexAuth();
  const keys = useQuery(api.apiKeys.listMine, auth.isAuthenticated ? {} : "skip");
  const createKey = useMutation(api.apiKeys.create);
  const [name, setName] = useState("Production");
  const [newKey, setNewKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");

    try {
      setNewKey(await createKey({ name }));
      setName("");
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "API key could not be created.");
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-5">
          <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use keys from your backend to create short links through the HTTP API.
          </p>
        </div>

        <form className="grid gap-3 border-b p-5 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Production"
            />
          </div>
          <Button type="submit" className="self-end" disabled={status === "saving"}>
            {status === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Create key
          </Button>
        </form>

        {newKey ? (
          <div className="border-b bg-muted/35 p-5">
            <Label>New API key</Label>
            <pre className="mt-2 overflow-x-auto rounded-md border bg-background p-3 text-sm">
              <code>{newKey}</code>
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              This is shown once. Store it in your backend secret manager.
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="border-b p-5 text-sm text-destructive">{error}</div>
        ) : null}

        <div className="divide-y">
          {keys === undefined ? (
            <div className="p-5 text-sm text-muted-foreground">Loading keys...</div>
          ) : keys.length === 0 ? (
            <div className="p-5 text-sm text-muted-foreground">No API keys yet.</div>
          ) : (
            keys.map((key) => (
              <div key={key._id} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {key.prefix}...
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {key.lastUsedAt
                    ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                    : "Never used"}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <aside className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4" />
          <h2 className="font-semibold">Create a link</h2>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6">
          <code>{`const response = await fetch("${siteConfig.url}/api/links", {
  method: "POST",
  headers: {
    authorization: \`Bearer \${process.env.EXECV_API_KEY}\`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    destination: "https://example.com/docs",
    slug: "docs"
  })
});

const link = await response.json();`}</code>
        </pre>
      </aside>
    </div>
  );
}
