import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-lvh flex-col items-center justify-center bg-gradient-to-b from-white/1 to-transparent">
      <main className="">{children}</main>
    </div>
  );
}
