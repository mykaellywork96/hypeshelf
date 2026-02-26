/**
 * Convex auth configuration for Clerk.
 *
 * Setup steps:
 * 1. In Clerk dashboard → JWT Templates → create a template named "convex"
 * 2. Copy the Issuer URL (looks like https://<slug>.clerk.accounts.dev)
 * 3. In Convex dashboard → Settings → Environment Variables, set:
 *    CLERK_JWT_ISSUER_DOMAIN = <your Clerk issuer URL>
 *
 * The `domain` below must exactly match the "iss" claim in the JWT.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN as string,
      applicationID: "convex",
    },
  ],
};
