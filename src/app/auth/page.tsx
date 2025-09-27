"use client";

import AuthCard from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setLastMethod(authClient.getLastUsedLoginMethod());
  }, []);

  const handleSubmit = async (
    e: React.FormEvent,
    type: "google" | "github" | "magic-link"
  ) => {
    e.preventDefault();

    if (isLoading) return;

    if (type === "magic-link") {
      if (!email || !email.includes("@")) {
        toast.error("Enter a valid email address");
        return;
      }
    }

    setIsLoading(true);
    setLoadingType(type);

    try {
      switch (type) {
        case "google":
          await authClient.signIn.social({ provider: "google" });
          break;

        case "github":
          await authClient.signIn.social({ provider: "github" });
          break;

        case "magic-link":
          await authClient.signIn.magicLink({ email });
          toast.success("Magic link sent! Check your inbox.");
          break;
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="flex max-w-4xl lg:w-4xl w-full items-center justify-between p-4 sm:p-6 lg:p-8 gap-12 h-screen md:h-full overflow-y-auto">
      <div className="flex-1 flex flex-col items-start justify-center gap-8">
        <div className="flex items-center justify-center gap-3 mb-1 w-full">
          <span className="font-extralight italic text-xl mb-10">
            NoMoreTutorials
          </span>
        </div>
        <div className="">
          <h1 className="text-2xl font-normal">Get Started</h1>
          <p className="font-light text-muted-foreground">
            Continue with anyone below to login to your account.
          </p>
        </div>
        <div className="flex flex-col space-y-4 w-full ">
          <form
            onSubmit={(e) => handleSubmit(e, "magic-link")}
            className="flex flex-col gap-3 w-full"
          >
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                disabled={isLoading}
                aria-label="Email address"
              />
              {isClient && lastMethod === "magic-link" ? (
                <LastUsedBadge />
              ) : null}
            </div>
            <Button
              size={"sm"}
              type="submit"
              className="lg:bg-foreground"
              disabled={isLoading}
            >
              {isLoading && loadingType === "magic-link" ? (
                <div className="flex gap-3 items-center">
                  <Loader2Icon className="animate-spin" />{" "}
                  <span>Sending ...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              variant={"outline"}
              className="relative"
              size={"lg"}
              onClick={(e) => handleSubmit(e, "google")}
              disabled={isLoading}
            >
              {isLoading && loadingType === "google" ? (
                "Connecting..."
              ) : (
                <div className="flex items-center gap-3">
                  <FcGoogle />
                  <span>Continue with Google</span>
                </div>
              )}
              {isClient && lastMethod === "google" ? <LastUsedBadge /> : null}
            </Button>
            <Button
              variant={"outline"}
              className="relative"
              size={"lg"}
              onClick={(e) => handleSubmit(e, "github")}
              disabled={isLoading}
            >
              {isLoading && loadingType === "github" ? (
                "Connecting..."
              ) : (
                <div className="flex items-center gap-3">
                  <FaGithub />
                  <span>Continue with Github</span>
                </div>
              )}
              {isClient && lastMethod === "github" ? <LastUsedBadge /> : null}
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 w-full">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </div>
      </div>
      <div className="lg:block flex-1 h-full hidden">
        <AuthCard />
      </div>
    </div>
  );
};

const LastUsedBadge = () => {
  return (
    <div
      className="absolute top-2.5 right-2 
      bg-primary/10 text-primary 
      text-[10px] font-medium 
      px-2 py-0.5 rounded-full 
      shadow-sm"
    >
      Last used
    </div>
  );
};

export default Auth;
