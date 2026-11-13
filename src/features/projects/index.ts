// Public API for features/projects module
// Enforced by architectural convention: external modules may only import from this file.

export * from "./types/projects.types";
export * from "./types/governance.types";
export * from "./api/projects.api";
export * from "./api/governance.api";
export * from "./queries/projects.queries";
export * from "./queries/governance.queries";
export * from "./components/ProjectStatusBadge";
export * from "./components/CreateProjectDialog";
export * from "./components/ProjectFilterTabs";
export * from "./components/ProjectTable";
export * from "./components/ProjectDetailHeader";
export * from "./components/StatusApprovalBanner";
export * from "./components/RequestStatusDialog";
export * from "./components/ProjectRosterModal";
export * from "./components/ProjectRepositoriesCard";

export * from "./components/ProjectDocumentsTab";
export * from "./components/ProjectDeletionDialog";
