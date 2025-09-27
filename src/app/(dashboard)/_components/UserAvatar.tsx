import { authClient } from "@/lib/auth-client";
import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";
import React, { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, CreditCard, User } from "lucide-react";
import { useRouter } from "next/navigation";

const UserAvatar = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const seed = session?.user?.id || "default";

  const handleSignout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth");
        },
      },
    });
  };

  const avatarSvg = useMemo(() => {
    return createAvatar(glass, {
      seed,
      radius: 50,
    }).toString();
  }, [seed]);

  const avatarUri = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="size-8 
        rounded-full 
        overflow-hidden 
        flex items-center justify-center 
        cursor-pointer 
        transition-transform duration-200 ease-in-out 
        hover:scale-110 
        active:scale-95"
        >
          <Image src={avatarUri} alt="User Avatar" width={"38"} height={"38"} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 bg-popover border-border/50 shadow-lg"
      >
        <div className="px-3 py-2 space-y-1">
          <p className="text font-medium leading-none">
            {session?.user.name || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {session?.user.email}
          </p>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Subscription
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={handleSignout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar;
