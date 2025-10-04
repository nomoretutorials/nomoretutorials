import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";

import { auth } from "@/lib/auth";

export async function getServerUserSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user ?? null;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      });
    } else {
      Sentry.setUser(null);
    }

    return user;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        funciton: "getServerUserSession",
        operation: "auth_session",
      },
    });

    return null;
  }
}
