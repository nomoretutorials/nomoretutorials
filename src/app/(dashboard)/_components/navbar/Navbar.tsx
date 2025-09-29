"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CommandIcon, FolderOpenDotIcon, LayoutDashboardIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useScrollTo } from "@/hooks/useScrollTo";
import SearchComponent from "../search/SearchBar";
import UserAvatar from "../user/UserAvatar";

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "#", label: "Projects", icon: FolderOpenDotIcon },
  ];

  const scrollTo = useScrollTo();
  const handleScrollToProjects = () => scrollTo("all-projects");

  return (
    <div className="bg-sidebar flex h-16 w-full items-center justify-between px-11">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-dark.png" alt="logo" height={32} width={60} />
        </Link>

        <div className="flex gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => {
                  if (label === "Projects") {
                    handleScrollToProjects();
                  }
                }}
              >
                {href === "#" ? (
                  <>
                    <Icon className="h-4 w-4" /> {label}
                  </>
                ) : (
                  <Link href={href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-[320px]">
          <Command className="bg-background rounded-xl border shadow-sm">
            <CommandInput
              placeholder="Search projects, settings, anything ..."
              onFocus={() => setOpen(true)}
              className="h-10 rounded-xl pr-14 text-sm focus:ring-0"
            />
          </Command>

          <div className="bg-muted/70 text-muted-foreground pointer-events-none absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[13px] shadow-sm">
            <CommandIcon className="h-3 w-3" /> K
          </div>

          <SearchComponent open={open} setOpen={setOpen} />
        </div>
        <div className="bg-border h-6 w-px" />
        <Tooltip>
          <TooltipTrigger>
            <a href="https://github.com/nomoretutorials/nomoretutorials" target="_blank">
              <FaGithub size={23} />
            </a>
          </TooltipTrigger>
          <TooltipContent>Github Repository</TooltipContent>
        </Tooltip>
        <div className="bg-border h-6 w-px" />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
