"use client";

import { Card } from "@/components/ui/card";

const AuthCard = () => {
  return (
    <Card className="relative h-full w-full overflow-hidden rounded-2xl border-none shadow-xl">
      <div className="from-primary/20 via-primary/10 to-accent/15 animate-gradient-x absolute inset-0 bg-linear-to-br" />

      <div className="via-primary/5 to-primary/10 animate-float absolute inset-0 bg-linear-to-tr from-transparent" />
    </Card>
  );
};

export default AuthCard;
