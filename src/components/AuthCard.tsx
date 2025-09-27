"use client";

import { Card } from "@/components/ui/card";

const AuthCard = () => {
  return (
    <Card className="relative h-full w-full rounded-2xl border-none overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/15 animate-gradient-x" />

      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-primary/10 animate-float" />
    </Card>
  );
};

export default AuthCard;
