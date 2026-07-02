"use client";

import {
  CreateOrganization,
  OrganizationProfile,
  OrganizationSwitcher,
  useAuth,
} from "@clerk/nextjs";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function OrganizationMembers() {
  const { orgId, isLoaded } = useAuth();

  if (!hasClerk) {
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Workspace members</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Configure team workspaces to invite members. App-managed member
          invites are intentionally disabled.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return null;
  }

  if (!orgId) {
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Building2 className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Create a workspace</h2>
        </div>
        <p className="mb-5 text-sm leading-6 text-muted-foreground">
          Members can only be invited into a managed workspace.
        </p>
        <CreateOrganization
          appearance={{
            elements: {
              cardBox: "shadow-none border rounded-lg",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Workspace members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite and remove members through workspace membership.
          </p>
        </div>
        <OrganizationSwitcher hidePersonal />
      </div>
      <OrganizationProfile
        routing="hash"
        appearance={{
          elements: {
            cardBox: "shadow-none border rounded-lg",
            navbar: "hidden",
          },
        }}
      />
      <Button className="mt-4" type="button" variant="outline">
        Managed workspace
      </Button>
    </div>
  );
}
