import "server-only";

import { PostHog } from "posthog-node";

let posthog: PostHog | null = null;

export function getServerPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!key) {
    return null;
  }

  if (!posthog) {
    posthog = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthog;
}

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, unknown>
) {
  const client = getServerPostHog();

  if (!client) {
    return;
  }

  client.capture({
    distinctId,
    event,
    properties,
  });

  await client.flush();
}
