import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, magicLink } from "better-auth/plugins";

import prisma from "./prisma";
import { magicLinkMail } from "./resend";

// TODO: 1. Implement T3 Env
// TODO: 2. Implement Google One Tap Login

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    cookies: {
      session_token: {
        name: "__Host-nmt.session", // host-only cookie in prod
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          useSecureCookies: true,
          path: "/",
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    lastLoginMethod({
      customResolveMethod: (ctx) => {
        if (ctx.path === "/magic-link/verify") {
          return "magic-link";
        }

        return null;
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        magicLinkMail(email, url);
      },
    }),
    nextCookies(),
  ],
});
