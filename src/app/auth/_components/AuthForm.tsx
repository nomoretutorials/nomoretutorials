"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLastMethod(authClient.getLastUsedLoginMethod());
  }, []);

  const handleSubmit = async (e: React.FormEvent, type: "google" | "github" | "magic-link") => {
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
          setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-5 text-center">
          <div className="bg-sidebar rounded-full border p-4">
            <MailCheckIcon size={"25"} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground truncate text-sm">
              We sent a verification link to <br />
              <span className="font-medium">{email}</span>
            </p>
          </div>
          <Button
            size="sm"
            className="bg-foreground hidden md:inline-flex"
            onClick={() => window.open("https://mail.google.com", "_blank")}
          >
            Open Gmail
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="mb-8">
        <div className="flex w-full items-center justify-center gap-3">
          <span className="mb-10 text-xl font-extralight italic">NoMoreTutorials</span>
        </div>
        <div className="">
          <h1 className="text-2xl font-normal">Get Started</h1>
          <p className="text-muted-foreground text-[16px] font-light">
            Continue with anyone below to login to your account.
          </p>
        </div>
      </div>
      <form onSubmit={(e) => handleSubmit(e, "magic-link")} className="flex w-full flex-col gap-3">
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
          {isClient && lastMethod === "magic-link" ? <LastUsedBadge /> : null}
        </div>
        <Button size="sm" type="submit" className="lg:bg-foreground" disabled={isLoading}>
          {isLoading && loadingType === "magic-link" ? (
            <div className="flex items-center gap-3">
              <Loader2Icon className="animate-spin" /> <span>Sending ...</span>
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
          variant="outline"
          className="relative"
          size="lg"
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
          variant="outline"
          className="relative"
          size="lg"
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
  );
};

const LastUsedBadge = () => {
  return (
    <div className="bg-primary/10 text-primary absolute top-2.5 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm">
      Last used
    </div>
  );
};

export default AuthForm;
