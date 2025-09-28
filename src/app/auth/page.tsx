// app/auth/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AuthCard from "@/components/AuthCard";
import { auth } from "@/lib/auth"; // your server-side auth utility

import LoginForm from "./_components/LoginForm";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/"); // instantly redirect if logged in
  }

  return (
    <div className="flex h-screen w-full max-w-4xl items-center justify-between gap-12 overflow-y-auto p-4 sm:p-6 md:h-full lg:w-4xl lg:p-8">
      <div className="flex flex-1 flex-col items-start justify-center gap-8">
        <div className="mb-1 flex w-full items-center justify-center gap-3">
          <span className="mb-10 text-xl font-extralight italic">NoMoreTutorials</span>
        </div>
        <div className="">
          <h1 className="text-2xl font-normal">Get Started</h1>
          <p className="text-muted-foreground font-light">
            Continue with anyone below to login to your account.
          </p>
        </div>
        <LoginForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary w-full text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </div>
      </div>
      <div className="hidden h-full flex-1 lg:block">
        <AuthCard />
      </div>
    </div>
  );
}
