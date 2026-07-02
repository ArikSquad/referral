import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Link2,
  LockKeyhole,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Users2,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const siteConfig = {
  name: "execv",
  tagline: "Invite-only link operations for referral-heavy teams.",
  description:
    "execv helps approved teams create clean short links, enforce whitelist policies, and track referral performance without shipping a custom redirect system.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  shortDomain: process.env.NEXT_PUBLIC_SHORT_DOMAIN ?? "example.com",
};

export type LinkStatus = "live" | "review" | "paused" | "blocked";
export type LinkMode = "Whitelist" | "Referral" | "Campaign" | "Internal";

export type ManagedLink = {
  id: string;
  name: string;
  slug: string;
  destination: string;
  owner: string;
  status: LinkStatus;
  mode: LinkMode;
  allowlist: string[];
  clicks: number;
  conversions: number;
  revenue: string;
  lastClick: string;
  risk: "low" | "medium" | "high";
  allowCountries?: string[];
  blockedCountries?: string[];
  accessKeyRequired?: boolean;
  affiliateNetwork?: string;
  affiliateStatus?: "not_connected" | "pending" | "connected" | "error";
};

export const managedLinks: ManagedLink[] = [];

export const dashboardMetrics = [
  {
    label: "Approved links",
    value: "0",
    change: "Connect data",
    icon: Link2,
    tone: "teal",
  },
  {
    label: "Verified clicks",
    value: "0",
    change: "No traffic",
    icon: MousePointerClick,
    tone: "blue",
  },
  {
    label: "Conversion rate",
    value: "0%",
    change: "No conversions",
    icon: BarChart3,
    tone: "amber",
  },
  {
    label: "Blocked attempts",
    value: "0",
    change: "No attempts",
    icon: ShieldCheck,
    tone: "red",
  },
] satisfies Array<{
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: "teal" | "blue" | "amber" | "red";
}>;

export const clickSeries: Array<{
  day: string;
  clicks: number;
  conversions: number;
  blocked: number;
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
  allowedDomains: string;
  policy: string;
}> = [];

export const featureTiles = [
  {
    icon: LockKeyhole,
    title: "Whitelist-first links",
    body: "Every short link can require approved destinations, referrers, countries, teams, or invite cohorts before it resolves.",
  },
  {
    icon: ClipboardCheck,
    title: "Manual approval built in",
    body: "Queue signups, link edits, destination changes, and new partner domains before traffic moves through them.",
  },
  {
    icon: BadgeCheck,
    title: "Paid access required",
    body: "Subscriptions unlock the workspace while free requests can remain queued until access is available.",
  },
  {
    icon: Activity,
    title: "Attribution that operators use",
    body: "See clicks, verified conversions, blocked attempts, source quality, and link-level revenue in one dashboard.",
  },
];

export const workflowSteps = [
  {
    title: "Request access",
    body: "Prospects join a waitlist, subscribe, and stay pending until an admin approves the account.",
  },
  {
    title: "Create governed links",
    body: "Teams generate clean suburls and attach destinations.",
  },
  {
    title: "Track and tune",
    body: "Operators monitor conversion quality, suspicious attempts, and partner performance before scaling traffic.",
  },
];


export const redirectTargets = new Map(
  managedLinks.map((link) => [link.slug, link.destination])
);

export const affiliateNetworks = [
  {
    id: "amazon-associates",
    name: "Amazon Associates",
    status: "available",
    fields: [
      "Tracking ID",
      "Marketplace",
      "API access key",
      "API secret key",
    ],
  },
  {
    id: "custom",
    name: "Custom partner network",
    status: "webhook",
    fields: ["Webhook URL", "Signing secret", "Revenue event mapping"],
  },
] as const;

export const affiliateSetupSteps = [
  {
    title: "Choose network",
    body: "Pick the partner program that owns attribution and payout data.",
  },
  {
    title: "Connect credentials",
    body: "Add tenant-owned tracking IDs, API credentials, or webhook secrets.",
  },
  {
    title: "Map revenue events",
    body: "Decide which approvals, orders, reversals, and payouts update profit.",
  },
  {
    title: "Attach to links",
    body: "Use the integration on referral links and monitor sync health.",
  },
] as const;

export const navItems = [
  { label: "Overview", href: "/app", icon: Activity },
  { label: "Links", href: "/app/links", icon: Link2 },
  { label: "Referrals", href: "/app/referrals", icon: Users2 },
  { label: "Audience", href: "/app/audience", icon: Globe2 }
];

export const qualitySignals = [
  { icon: CheckCircle2, label: "Allowlisted destinations" },
  { icon: ShieldCheck, label: "Approved members only" },
  { icon: Sparkles, label: "Clean branded suburls" },
  { icon: Zap, label: "Real-time operator views" },
];
