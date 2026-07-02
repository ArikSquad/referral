const authConfig = {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://replace-with-your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
