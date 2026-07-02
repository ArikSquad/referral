import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { requiredPlan } from "@/lib/env";

export type AppAccess =
  | {
      mode: "clerk";
      status: "active";
      userName: string;
    }
  | {
      mode: "clerk";
      status: "pending-approval" | "rejected" | "needs-plan";
      userName: string;
    };

type HasEntitlement = (params: { plan?: string; feature?: string }) => boolean;

export async function getAppAccess(): Promise<AppAccess> {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in?redirect_url=/app");
  }

  const user = await currentUser();
  const userName = user?.firstName ?? user?.username ?? "Approved member";
  const approvalStatus = user?.publicMetadata.approvalStatus;

  if (approvalStatus === "rejected") {
    return {
      mode: "clerk",
      status: "rejected",
      userName
    };
  }

  const has = session.has as HasEntitlement;
  const hasPaidPlan =
    has({ plan: requiredPlan }) || has({ feature: "links:manage" });

  if (hasPaidPlan) {
    return {
      mode: "clerk",
      status: "active",
      userName
    };
  }

  if (approvalStatus !== "approved") {
    return {
      mode: "clerk",
      status: "pending-approval",
      userName,
    };
  }

  return {
    mode: "clerk",
    status: "needs-plan",
    userName
  };
}
