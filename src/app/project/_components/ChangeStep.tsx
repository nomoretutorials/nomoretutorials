import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const ChangeStep = () => {
  return (
    <div className="bg-background border-border sticky right-0 bottom-0 left-0 flex h-16 items-center justify-between border-t p-4 shadow-[0_8px_60px_rgba(0,0,0,0.8)]">
      <Button variant={"outline"} className="cursor-pointer rounded-sm">
        <ArrowLeft />
        <span>Previous Step</span>
      </Button>
      <Button variant={"outline"} className="cursor-pointer rounded-sm rounded-br-xl">
        <span>Next Step</span>
        <ArrowRight />
      </Button>
    </div>
  );
};

export default ChangeStep;
