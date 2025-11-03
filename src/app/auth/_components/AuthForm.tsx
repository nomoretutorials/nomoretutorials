"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircleIcon, Loader2Icon, MailCheckIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

// TODO: add debouncing and rate limitting. add client side error handling.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(true);

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
        Sentry.addBreadcrumb({
          category: "validation",
          message: "Invalid email format",
          level: "warning",
          data: { email: email.replace(/[^@]/g, "*") }, // Mask email for privacy
        });
        return;
      }
    }

    Sentry.addBreadcrumb({
      category: "auth",
      message: `User attempting sign-in with ${type}`,
      level: "info",
      data: { method: type },
    });

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
          Sentry.addBreadcrumb({
            category: "auth",
            message: "Magic link sent successfully",
            level: "info",
          });
          break;
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: "AuthForm",
          operation: "signin",
          auth_method: type,
        },
        extra: {
          email: type === "magic-link" ? email.replace(/[^@]/g, "*") : undefined, // Mask email
          lastUsedMethod: lastMethod,
        },
      });
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
              <MailCheckIcon className="text-primary h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Check your email</h2>
            <div>
              <p className="text-muted-foreground text-base">We sent a verification link to</p>
              <p className="text-foreground text-base font-medium">{email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.open("https://mail.google.com", "_blank")}
            >
              Open Gmail
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Use a different email
            </Button>
          </div>

          <div className="bg-muted/50 space-y-3 rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium">Can&apos;t find the email?</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Check your spam or junk folder. Mark our email as &quot;Not Spam&quot; to ensure
                  future messages reach your inbox.
                </p>
              </div>
            </div>
          </div>
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
          <p className="text-muted-foreground text-[1rem] font-light">
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
            autoComplete="email"
          />
          {isClient && lastMethod === "magic-link" ? <LastUsedBadge /> : null}
        </div>
        <Button
          size="sm"
          type="submit"
          className="lg:bg-foreground"
          disabled={isLoading}
          aria-busy={isLoading}
        >
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
          aria-busy={isLoading}
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
          aria-busy={isLoading}
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
    <div className="bg-primary/10 text-primary absolute top-2.5 right-2 rounded-full px-2 py-0.5 text-[0.625rem] font-medium shadow-sm">
      Last used
    </div>
  );
};

export default AuthForm;
