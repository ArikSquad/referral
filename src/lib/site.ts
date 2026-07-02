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

export type LinkMode = "Whitelist" | "Referral" | "Campaign" | "Internal";

export type ManagedLink = {
  id: string;
  kind?: "link" | "collection";
  name: string;
  slug: string;
  destination: string;
  owner: string;
  status: "review" | "live" | "paused" | "blocked";
  mode: LinkMode | "Collection";
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
  startsAt?: number;
  expiresAt?: number;
};

export const managedLinks: ManagedLink[] = [];

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
  policy: string;
}> = [];

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
    id: "impact",
    name: "Impact",
    status: "available",
    fields: ["Account SID", "Campaign", "API credentials", "Webhook URL"],
  },
  {
    id: "partnerstack",
    name: "PartnerStack",
    status: "available",
    fields: ["Partner key", "Campaign", "Webhook URL"],
  },
  {
    id: "shareasale",
    name: "ShareASale",
    status: "available",
    fields: ["Affiliate ID", "Merchant ID", "API token"],
  },
  {
    id: "cj-affiliate",
    name: "CJ Affiliate",
    status: "available",
    fields: ["Publisher ID", "Website ID", "Personal access token"],
  },
  {
    id: "rakuten-advertising",
    name: "Rakuten Advertising",
    status: "available",
    fields: ["Publisher ID", "Advertiser ID", "API token"],
  },
  {
    id: "awin",
    name: "Awin",
    status: "available",
    fields: ["Publisher ID", "Advertiser ID", "OAuth token"],
  },
  {
    id: "clickbank",
    name: "ClickBank",
    status: "available",
    fields: ["Nickname", "Tracking ID", "API key"],
  },
  {
    id: "rewardful",
    name: "Rewardful",
    status: "available",
    fields: ["Campaign ID", "API secret", "Webhook secret"],
  },
  {
    id: "firstpromoter",
    name: "FirstPromoter",
    status: "available",
    fields: ["Campaign ID", "API key", "Webhook secret"],
  },
  {
    id: "tapfiliate",
    name: "Tapfiliate",
    status: "available",
    fields: ["Program ID", "API key", "Webhook URL"],
  },
  {
    id: "lemonsqueezy",
    name: "Lemon Squeezy",
    status: "available",
    fields: ["Store ID", "Variant ID", "Signing secret"],
  },
  {
    id: "paddle",
    name: "Paddle",
    status: "available",
    fields: ["Vendor ID", "Product ID", "Webhook secret"],
  },
  {
    id: "stripe",
    name: "Stripe referrals",
    status: "available",
    fields: ["Account ID", "Promotion code", "Webhook secret"],
  },
  {
    id: "custom-webhook",
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
