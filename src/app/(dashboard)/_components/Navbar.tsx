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

const Navbar = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full h-16 flex items-center justify-between bg-sidebar px-12 border-b border-border">
      <div className="flex items-center gap-12">
        <Image src="/logo-dark.png" alt="logo" height={40} width={65} />
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={"/"} className="flex items-center gap-2">
              <LayoutDashboardIcon className="w-4 h-4" /> Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={"/"} className="flex items-center gap-2">
              <FolderOpenDotIcon className="w-4 h-4" /> Projects
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-[300px]">
          <Command>
            <CommandInput
              placeholder="Search..."
              onFocus={() => setOpen(true)}
              className="h-10 pr-14 text-sm focus:ring-0"
            />
          </Command>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-muted/70 px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground pointer-events-none">
            <CommandIcon className="w-3 h-3" /> K
          </div>

          <SearchComponent open={open} setOpen={setOpen} />
        </div>

        <div className="w-px h-6 bg-border" />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
