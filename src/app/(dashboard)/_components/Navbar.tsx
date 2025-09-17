"use client";

import { Button } from "@/components/ui/button";
import {
  FolderOpenDotIcon,
  LayoutDashboardIcon,
  CommandIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SearchComponent from "./SearchComponent";
import { Command, CommandInput } from "@/components/ui/command";
import UserAvatar from "./UserAvatar";
import { FaGithub } from "react-icons/fa";

import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/projects", label: "Projects", icon: FolderOpenDotIcon },
  ];

  return (
    <div className="w-full h-16 flex items-center justify-between bg-sidebar px-11">
      <div className="flex items-center gap-6">
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-dark.png" alt="logo" height={32} width={60} />
        </Link>

        {/* Nav links */}
        <div className="flex gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={`flex items-center gap-2`}
              >
                <Link href={href}>
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-[320px]">
          <Command className="rounded-xl border bg-background shadow-sm">
            <CommandInput
              placeholder="Search projects, settings, anything ..."
              onFocus={() => setOpen(true)}
              className="h-10 pr-14 text-sm focus:ring-0 rounded-xl"
            />
          </Command>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-muted/70 px-2 py-0.5 rounded-md text-[13px] font-mono text-muted-foreground pointer-events-none shadow-sm">
            <CommandIcon className="w-3 h-3" /> K
          </div>

          <SearchComponent open={open} setOpen={setOpen} />
        </div>
        <div className="w-px h-6 bg-border" />
        <FaGithub size={23} />
        <div className="w-px h-6 bg-border" />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
