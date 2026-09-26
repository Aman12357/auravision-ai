import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface UiState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light' | 'system';
  currentWorkspaceId: string | null;
  toasts: Toast[];
}

const initialState: UiState = {
  sidebarCollapsed: false,
  activeModal: null,
  theme: 'dark',
  currentWorkspaceId: null,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'system'>) => {
      state.theme = action.payload;
    },
    setCurrentWorkspaceId: (state, action: PayloadAction<string | null>) => {
      state.currentWorkspaceId = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      state.toasts.push({
        ...action.payload,
        id: Math.random().toString(36).substring(2, 9),
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  setTheme,
  setCurrentWorkspaceId,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
