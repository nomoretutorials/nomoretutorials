import { getServerUserSession } from "@/utils/get-server-user-session";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUserSession();
  if (user) redirect("/");

  return (
    <div className="flex h-lvh flex-col items-center justify-center bg-linear-to-b from-white/1 to-transparent">
      <main className="">{children}</main>
    </div>
  );
}
