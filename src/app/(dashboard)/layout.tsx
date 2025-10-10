import { redirect } from "next/navigation";
import React from "react";
import { getServerUserSession } from "@/utils/get-server-user-session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUserSession();
  if (!user) redirect("/auth");
  return <>{children}</>;
}
