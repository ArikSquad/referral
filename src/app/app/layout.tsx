import type { ReactNode } from "react";

import { AccessGate } from "@/components/dashboard/access-gate";
import { AppShell } from "@/components/dashboard/app-shell";
import { getAppAccess } from "@/lib/auth";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAppAccess();

  if (access.status !== "active") {
    return <AccessGate access={access} />;
  }

  return <AppShell access={access}>{children}</AppShell>;
}
