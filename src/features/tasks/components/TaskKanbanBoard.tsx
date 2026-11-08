"use client";

import React from "react";
import { TaskChecklistBoard } from "./TaskChecklistBoard";

export { TaskChecklistBoard };

interface TaskKanbanBoardProps {
  project: {
    id: string;
    name: string;
    status: string;
  };
}

/**
 * TaskKanbanBoard telah digantikan oleh TaskChecklistBoard
 * sesuai spesifikasi PRD & Business Rules (BR-TASK-01 s.d. BR-TASK-05).
 */
export function TaskKanbanBoard(props: TaskKanbanBoardProps) {
  return <TaskChecklistBoard {...props} />;
}
