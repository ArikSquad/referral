import {
  Activity,
  Globe2,
  KeyRound,
  Link2,
} from "lucide-react";

export const siteConfig = {
  name: "execv",
  tagline: "Paid URL shortener for developers.",
  description:
    "execv helps developers create short links from a dashboard or API and track clicks without running redirect infrastructure.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  shortDomain: process.env.NEXT_PUBLIC_SHORT_DOMAIN ?? "example.com",
};

export type ManagedLink = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  owner: string;
  status: "live" | "paused";
  clicks: number;
  lastClick: string;
  createdVia?: "dashboard" | "api";
};

export const managedLinks: ManagedLink[] = [];

export const clickSeries: Array<{
  day: string;
  clicks: number;
}> = [];

export const sourceSeries: Array<{ source: string; value: number }> = [];

export const approvalQueue: Array<{
  requester: string;
  email: string;
  reason: string;
  status: string;
  submitted: string;
}> = [];

export const audienceRows: Array<{
  segment: string;
  members: string;
  policy: string;
}> = [];

export const redirectTargets = new Map(
  managedLinks.map((link) => [link.slug, link.destination])
);

export const navItems = [
  { label: "Overview", href: "/app", icon: Activity },
  { label: "Links", href: "/app/links", icon: Link2 },
  { label: "API keys", href: "/app/api-keys", icon: KeyRound },
  { label: "Analytics", href: "/app/analytics", icon: Globe2 }
];
