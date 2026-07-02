import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { hasHostedAuthServerEnv, requiredPlan } from "@/lib/env";

export type AppAccess =
  | {
      mode: "demo";
      status: "active";
      userName: string;
      message: string;
    }
  | {
      mode: "clerk";
      status: "active";
      userName: string;
      message: string;
    }
  | {
      mode: "clerk";
      status: "pending-approval" | "rejected" | "needs-plan";
      userName: string;
      message: string;
    };

type HasEntitlement = (params: { plan?: string; feature?: string }) => boolean;

export async function getAppAccess(): Promise<AppAccess> {
  if (!hasHostedAuthServerEnv()) {
    return {
      mode: "demo",
      status: "active",
      userName: "Demo workspace",
      message: "Demo mode is active for local review.",
    };
  }

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
      userName,
      message:
        "This account was not approved for the private link workspace.",
    };
  }

  const has = session.has as HasEntitlement;
  const hasPaidPlan =
    has({ plan: requiredPlan }) || has({ feature: "links:manage" });

  if (hasPaidPlan) {
    return {
      mode: "clerk",
      status: "active",
      userName,
      message: "Access verified through your subscription.",
    };
  }

  if (approvalStatus !== "approved") {
    return {
      mode: "clerk",
      status: "pending-approval",
      userName,
      message:
        "You can wait indefinitely for possible free access, or subscribe to unlock access now.",
    };
  }

  return {
    mode: "clerk",
    status: "needs-plan",
    userName,
    message: `The ${requiredPlan} plan is required before the dashboard unlocks.`,
  };
}
