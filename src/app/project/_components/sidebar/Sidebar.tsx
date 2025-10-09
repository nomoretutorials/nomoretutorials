import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addGithubRepoURL } from "@/actions/project-actions";
import { Step } from "@/types/project";
import { identicon } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Check, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useResizableSidebar } from "@/hooks/useSidebar";
import SidebarSteps from "./SidebarSteps";

export type SidebarProps = {
  steps: Step[];
  title: string;
  repoUrl: string;
  currentStepIndex: number;
  onStepSelect: (index: number) => void;
  projectId: string
};

export default function Sidebar({
  steps,
  title,
  repoUrl,
  currentStepIndex,
  onStepSelect,
  projectId
}: SidebarProps) {
  const { sidebarWidth, isDragging, resizerRef, onPointerDown } = useResizableSidebar(projectId);
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [githubUrl, setGithubUrl] = useState(repoUrl);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
  const [githubRepoAdded, setGithubRepoAdded] = useState(!!repoUrl);

  const avatarDataUri = useMemo(() => {
    try {
      const svg = createAvatar(identicon, { seed: projectId }).toString();
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return "data:image/svg+xml;base64,=";
    }
  }, [projectId]);

  const handleGithubToggle = () => {
    setShowGithubInput((prev) => !prev);
  };

  const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGithubUrl(value);
    setError("");

    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+(\/[\w-]+)?\/?$/;
    setIsValid(!value || githubRegex.test(value));
  };

  const handleSave = async () => {
    if (!isValid || !githubUrl) {
      setError("Enter a valid Github URL");
    }

    try {
      await addGithubRepoURL(projectId, githubUrl);
      setGithubRepoAdded(true);
    } catch (error) {}

    setShowGithubInput(false);
  };

  return (
    <>
      <aside
        className={`h-full flex-shrink-0 border-r bg-gradient-to-b from-white/2 to-transparent p-4 transition-shadow duration-150 ${
          isDragging ? "shadow-xl" : "shadow-sm"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full flex-col gap-4">
          {/* Project header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={avatarDataUri}
                alt="avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg border"
              />
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-muted-foreground max-w-[160px] truncate text-sm">
                  {projectId}
                </div>
              </div>
            </div>
            <div onClick={handleGithubToggle}>
              <FaGithub size={23} />
            </div>
          </div>
          {showGithubInput && (
            <div>
              <Label htmlFor="github" className="text-muted-foreground text-xs font-medium">
                GitHub Repository
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  id="github"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl || ""}
                  onChange={handleGithubChange}
                  className={cn(
                    "text-sm",
                    !isValid && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {githubRepoAdded ? (
                  <Link
                    href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon" disabled={!githubUrl || !isValid}>
                      <ExternalLink size={14} />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    disabled={!githubUrl || !isValid}
                  >
                    <Check size={14} />
                  </Button>
                )}
              </div>
              {!error && <p className="text-destructive mt-1 text-xs">{error}</p>}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-auto">
            <SidebarSteps
              steps={steps}
              currentStepIndex={currentStepIndex}
              onStepSelect={onStepSelect}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-muted-foreground ml-auto text-xs">
              {Math.round(sidebarWidth)}px
            </div>
          </div>
        </div>
      </aside>

      <div
        id="resizer"
        ref={resizerRef}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(sidebarWidth)}
        className={`-ml-3 flex w-3 cursor-col-resize items-center justify-center transition-colors select-none ${
          isDragging ? "bg-muted/10" : "bg-transparent"
        }`}
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }}
      >
        <div className="bg-muted-foreground/30 h-8 w-px" />
      </div>
    </>
  );
}
