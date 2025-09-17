import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-lvh flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
      <main className="">{children}</main>
    </div>
  );
}
