import { useState } from 'react';
import { Workspace } from '@/types/workspace';

const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Personal Workspace',
    slug: 'personal',
    description: null,
    avatarUrl: null,
    plan: 'PRO',
    creditsBalance: 450,
    storageUsedBytes: 1024 * 1024 * 500, // 500MB
    storageLimitBytes: 1024 * 1024 * 1024 * 10, // 10GB
    memberCount: 1,
    ownerId: 'user-1',
    createdAt: new Date().toISOString()
  }
];

export const useWorkspace = () => {
  const workspaces = mockWorkspaces;
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>('ws-1');

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || null;

  const setCurrentWorkspace = (id: string) => {
    setCurrentWorkspaceId(id);
  };

  return {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    isLoading: false
  };
};
