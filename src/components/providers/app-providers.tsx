"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { PostHogProvider } from "@posthog/react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "next-themes";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useEffect, useMemo, type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_CLOUD_URL;
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    defaults: "2025-05-24",
    person_profiles: "identified_only",
  });
}

function PageViewCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    const search = searchParams.toString();
    posthog.capture("$pageview", {
      current_url: `${window.location.origin}${pathname}${
        search ? `?${search}` : ""
      }`,
    });
  }, [pathname, searchParams]);

  return null;
}

function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewCapture />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}

function DataProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    []
  );

  if (!client || !clerkKey) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const tree = (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </TooltipProvider>
    </ThemeProvider>
  );

  if (!clerkKey) {
    return tree;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <DataProvider>{tree}</DataProvider>
    </ClerkProvider>
  );
}
