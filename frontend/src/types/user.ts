export type Role = 'ADMIN' | 'USER' | 'PRO_USER';

export interface Permission {
  id: string;
  name: string;
}

export interface UserProfile {
  avatarUrl?: string;
  bio?: string;
  website?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  roles: Role[];
  permissions: Permission[];
  profile?: UserProfile;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}
