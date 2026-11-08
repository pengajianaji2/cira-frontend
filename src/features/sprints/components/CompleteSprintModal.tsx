"use client";

import React from "react";
import { CloseSprintModal } from "./CloseSprintModal";
import { Sprint } from "../types/sprints.types";

interface CompleteSprintModalProps {
  projectId: string;
  sprint: Sprint;
  allSprints?: Sprint[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * CompleteSprintModal dialihkan ke CloseSprintModal
 * untuk mendukung resolusi task TODO atomik sesuai BR-SPRINT-04 & BR-SPRINT-05.
 */
export function CompleteSprintModal(props: CompleteSprintModalProps) {
  return <CloseSprintModal {...props} />;
}
