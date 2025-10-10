import { redirect } from "next/navigation";
import { getServerUserSession } from "@/utils/get-server-user-session";

export default async function ProjectLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUserSession();
  if (!user) redirect("/auth");
  return (
    <div className="bg-sidebar h-lvh">
      <main className="h-full">{children}</main>
    </div>
  );
}
