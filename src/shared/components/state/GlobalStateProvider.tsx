"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  useWorkspaceStore,
  FilterStatus,
  SortField,
  SortOrder,
} from "../../store/workspace.store";

interface GlobalStateContextValue {
  // Store values
  filterStatus: FilterStatus;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  activeTabByProject: Record<string, string>;
  loadedTabsByProject: Record<string, Record<string, boolean>>;

  // Actions
  setFilterStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (field: SortField, order?: SortOrder) => void;
  setActiveTab: (projectId: string, tab: string) => void;
  markTabLoaded: (projectId: string, tab: string) => void;
  resetFilters: () => void;

  // Convenience helpers
  isTabLoaded: (projectId: string, tab: string) => boolean;
  getActiveTab: (projectId: string, defaultTab?: string) => string;
}

const GlobalStateContext = createContext<GlobalStateContextValue | null>(null);

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const store = useWorkspaceStore();

  const contextValue = useMemo<GlobalStateContextValue>(() => {
    return {
      filterStatus: store.filterStatus,
      searchQuery: store.searchQuery,
      sortField: store.sortField,
      sortOrder: store.sortOrder,
      activeTabByProject: store.activeTabByProject,
      loadedTabsByProject: store.loadedTabsByProject,

      setFilterStatus: store.setFilterStatus,
      setSearchQuery: store.setSearchQuery,
      setSorting: store.setSorting,
      setActiveTab: store.setActiveTab,
      markTabLoaded: store.markTabLoaded,
      resetFilters: store.resetFilters,

      isTabLoaded: (projectId: string, tab: string) => {
        return Boolean(store.loadedTabsByProject[projectId]?.[tab]);
      },
      getActiveTab: (projectId: string, defaultTab = "prd") => {
        return store.activeTabByProject[projectId] || defaultTab;
      },
    };
  }, [
    store.filterStatus,
    store.searchQuery,
    store.sortField,
    store.sortOrder,
    store.activeTabByProject,
    store.loadedTabsByProject,
    store.setFilterStatus,
    store.setSearchQuery,
    store.setSorting,
    store.setActiveTab,
    store.markTabLoaded,
    store.resetFilters,
  ]);

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState(): GlobalStateContextValue {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a <GlobalStateProvider>");
  }
  return context;
}
