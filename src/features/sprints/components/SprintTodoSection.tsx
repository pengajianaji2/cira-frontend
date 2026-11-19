"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Sprint } from "../types/sprints.types";
import { TaskChecklistBoard } from "@/features/tasks/components/TaskChecklistBoard";

interface SprintTodoSectionProps {
  project: { id: string; name: string; status: string };
  sprint: Sprint;
}

export function SprintTodoSection({ project, sprint }: SprintTodoSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const label = isExpanded ? "Sembunyikan Todo" : "Tampilkan Todo";

  return (
    <div id={sprint.status === "active" ? "sprint-tasks" : undefined} className="space-y-3 border-t border-border/60 pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="h-9 rounded-full px-3 text-xs"
      >
        <HugeiconsIcon
          icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
          className="mr-1.5 size-3.5"
          aria-hidden="true"
        />
        {label}
      </Button>
      {isExpanded && <TaskChecklistBoard project={project} sprintId={sprint.id} />}
    </div>
  );
}
