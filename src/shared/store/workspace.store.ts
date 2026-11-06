import { create } from "zustand";

export type FilterStatus = "all" | "lead" | "active" | "completed" | "cancelled";
export type SortField = "name" | "createdAt" | "contractValue" | "status";
export type SortOrder = "asc" | "desc";

export interface WorkspaceState {
  filterStatus: FilterStatus;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  activeTabByProject: Record<string, string>;
  loadedTabsByProject: Record<string, Record<string, boolean>>;

  setFilterStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (field: SortField, order?: SortOrder) => void;
  setActiveTab: (projectId: string, tab: string) => void;
  markTabLoaded: (projectId: string, tab: string) => void;
  resetFilters: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  filterStatus: "all",
  searchQuery: "",
  sortField: "createdAt",
  sortOrder: "desc",
  activeTabByProject: {},
  loadedTabsByProject: {},

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSorting: (field, order) =>
    set((state) => ({
      sortField: field,
      sortOrder: order ?? (state.sortField === field && state.sortOrder === "asc" ? "desc" : "asc"),
    })),

  setActiveTab: (projectId, tab) =>
    set((state) => ({
      activeTabByProject: {
        ...state.activeTabByProject,
        [projectId]: tab,
      },
    })),

  markTabLoaded: (projectId, tab) =>
    set((state) => ({
      loadedTabsByProject: {
        ...state.loadedTabsByProject,
        [projectId]: {
          ...(state.loadedTabsByProject[projectId] || {}),
          [tab]: true,
        },
      },
    })),

  resetFilters: () =>
    set({
      filterStatus: "all",
      searchQuery: "",
      sortField: "createdAt",
      sortOrder: "desc",
    }),
}));
