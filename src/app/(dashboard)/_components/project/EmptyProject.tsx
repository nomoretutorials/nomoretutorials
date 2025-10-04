import { FolderOpen } from "lucide-react";

const EmptyProject = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-16">
      <div className="bg-card rounded-lg border p-3">
        <FolderOpen className="size-7" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-xl font-semibold">You dont have any Projects</h1>
        <span className="text-muted-foreground">Start by creating one.</span>
      </div>
    </div>
  );
};

export default EmptyProject;
