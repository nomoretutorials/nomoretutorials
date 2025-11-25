import AuthCard from "@/app/auth/_components/AuthCard";

import AuthForm from "./_components/AuthForm";

export const metadata = { title: "Authentication", description: "Get started with your account." };

export default async function AuthPage() {
  return (
    <div className="flex h-screen w-full max-w-4xl items-center justify-between gap-12 overflow-y-auto p-4 sm:p-6 md:h-full lg:w-4xl lg:p-8">
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-8">
        <AuthForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary mx-auto w-full max-w-sm text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </div>
      </div>
      <div className="hidden h-108 flex-1 lg:block">
        <AuthCard />
      </div>
    </div>
  );
}
