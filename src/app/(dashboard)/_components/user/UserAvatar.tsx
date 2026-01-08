import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "@/store/project-store-provider";
import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { CornerDownLeft, CreditCard, LogOut, Settings, User } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

const UserAvatar = () => {
  const { data: session } = authClient.useSession();

  const seed = session?.user?.id || "default";

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
        <div className="flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95">
          <Image src={avatarUri} alt="User Avatar" width={"38"} height={"38"} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="bg-popover border-border/50 w-56 shadow-lg"
      >
        <div className="space-y-1 px-3 py-2">
          <p className="text leading-none font-medium">{session?.user.name || "Anonymous"}</p>
          <p className="text-muted-foreground truncate text-xs">{session?.user.email}</p>
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <LogOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogOutButton = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth");

            // TODO: Implement Global Zustand State Reset
            // useProjectStore.getState().resetState();
            // useProjectStore.persist.clearStorage();
          },
          onError: () => {
            // Error handling
          },
        },
      });
    } catch (error) {
      // Error handling
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && e.key === "Enter") {
        e.preventDefault();
        handleSignout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex cursor-pointer items-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You’ll need to log in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignout}>
            Sign Out
            <kbd className="bg-muted/10 ml-1 rounded px-1.5 py-0.5 font-mono text-xs">
              <CornerDownLeft />
            </kbd>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserAvatar;
