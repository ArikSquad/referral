"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Command,
  LogIn,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { AppAccess } from "@/lib/auth";
import { navItems, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AppShell({
  children,
  access,
}: {
  children: ReactNode;
  access: AppAccess;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          <div>
            <Link href="/" className="font-semibold tracking-tight">
              {siteConfig.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {siteConfig.shortDomain}
            </p>
          </div>
        </div>
        <nav className="grid gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/app"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
                <ChevronRight className="size-3" />
                <span>Dashboard</span>
              </div>
              <p className="truncate text-sm font-medium">
                {access.userName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Alerts">
                    <Bell className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approval and risk alerts</TooltipContent>
              </Tooltip>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/app/links/new">
                  <Plus className="size-4" />
                  New link
                </Link>
              </Button>
              {hasClerk ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-8",
                    },
                  }}
                />
              ) : (
                <Button asChild variant="ghost" size="icon" aria-label="Sign in">
                  <Link href="/sign-in">
                    <LogIn className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t px-2 py-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/app"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Button
                  asChild
                  key={item.href}
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
