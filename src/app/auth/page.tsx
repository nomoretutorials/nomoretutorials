"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// TODO: Implement Toast instead of alert.
// TODO: Implement disables buttons

const Auth = () => {
  const [email, setEmail] = useState("");
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLastMethod(authClient.getLastUsedLoginMethod());
  }, []);

  const handleSubmit = async (
    e: React.FormEvent,
    type: "google" | "github" | "email"
  ) => {
    e.preventDefault();

    if (type === "email") {
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email");
        return;
      }
    }

    try {
      switch (type) {
        case "google":
          await authClient.signIn.social({ provider: "google" });
          break;

        case "github":
          await authClient.signIn.social({ provider: "github" });
          break;

        case "email":
          await authClient.signIn.magicLink({ email });
          alert("Magic link sent! Check your inbox.");
          break;
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex border w-4xl items-center justify-between p-8 gap-8">
      <div className="flex-1 flex flex-col items-start justify-center gap-8">
        <div className="">
          <h1 className="text-2xl font-normal">Get Started</h1>
          <p className="font-light">
            Continue with anyone below to login to your account.
          </p>
        </div>
        <div className="flex flex-col space-y-4 w-full ">
          <form
            onSubmit={(e) => handleSubmit(e, "email")}
            className="flex flex-col gap-3 w-full"
          >
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your your Email."
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              {isClient && lastMethod === "email" ? <LastUsedBadge /> : null}
            </div>
            <Button size={"sm"} type="submit">
              Submit
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
            >
              Continue with Google
              {isClient && lastMethod === "google" ? <LastUsedBadge /> : null}
            </Button>
            <Button
              variant={"outline"}
              className="relative"
              size={"lg"}
              onClick={(e) => handleSubmit(e, "github")}
            >
              Continue with Github
              {isClient && lastMethod === "github" ? <LastUsedBadge /> : null}
            </Button>
          </div>
        </div>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </div>
      </div>
      <div className="flex-1 border"></div>
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
