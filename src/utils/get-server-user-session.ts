import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getServerUserSession() {
  try {
    const response = await auth.api.getSession({
      headers: await headers(),
    });

    const user = response?.user ?? null;

    return user;
  } catch (error) {
    return null;
  }
}
