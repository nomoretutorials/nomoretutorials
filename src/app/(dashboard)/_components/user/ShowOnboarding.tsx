"use client";

import OnboardingPage from "@/app/onboarding/page";

export default function ShowOnboarding({ show }: { show: boolean }) {
  if (!show) return null;
  return <OnboardingPage />;
}
