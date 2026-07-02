export const requiredPlan = process.env.CLERK_REQUIRED_PLAN ?? "pro";

export function hasHostedAuthClientEnv() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function hasHostedAuthServerEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}
