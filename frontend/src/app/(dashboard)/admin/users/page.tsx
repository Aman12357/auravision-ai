'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Search, MoreHorizontal, Lock, Unlock, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { adminApi } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'lock' | 'unlock' | 'delete' | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers', searchTerm],
    queryFn: () => adminApi.getUsers({ search: searchTerm }),
  });

  // Fallback mock data
  const users = usersData?.items || [
    { id: '1', username: 'alex_dev', email: 'alex@example.com', plan: 'PRO', videos: 142, credits: 850, joined: '2023-10-12', status: 'ACTIVE' },
    { id: '2', username: 'sarah_m', email: 'sarah@example.com', plan: 'FREE', videos: 12, credits: 40, joined: '2024-01-05', status: 'ACTIVE' },
    { id: '3', username: 'spammer99', email: 'spam@test.com', plan: 'FREE', videos: 0, credits: 0, joined: '2024-03-20', status: 'LOCKED' },
  ];

  const columns = [
    {
      accessorKey: 'username',
      header: 'User',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
            {row.original.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-white">{row.original.username}</div>
            <div className="text-xs text-gray-400">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.original.plan === 'PRO' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-gray-800 text-gray-300'
        } `}>
          {row.original.plan}
        </span>
      ),
    },
    {
      accessorKey: 'videos',
      header: 'Videos Gen.',
    },
    {
      accessorKey: 'credits',
      header: 'Credits Used',
    },
    {
      accessorKey: 'joined',
      header: 'Joined Date',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
          row.original.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded" title="View Profile">
              <Eye className="h-4 w-4" />
            </button>
            {user.status === 'ACTIVE' ? (
              <button 
                onClick={() => { setSelectedUser(user); setActionModal('lock'); }}
                className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded" title="Lock Account"
              >
                <Lock className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={() => { setSelectedUser(user); setActionModal('unlock'); }}
                className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded" title="Unlock Account"
              >
                <Unlock className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={() => { setSelectedUser(user); setActionModal('delete'); }}
              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded" title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage user accounts, plans, and platform access.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>
      </div>

      <div className="group">
        <DataTable columns={columns} data={users} isLoading={isLoading} />
      </div>

      {/* Action Modals */}
      <Modal
        isOpen={actionModal !== null}
        onClose={() => setActionModal(null)}
        title={
          actionModal === 'lock' ? 'Lock User Account' :
          actionModal === 'unlock' ? 'Unlock User Account' : 'Delete User'
        }
        description={`Are you sure you want to ${actionModal} ${selectedUser?.username}?`}
        footer={
          <>
            <button
              onClick={() => setActionModal(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors mb-2 sm:mb-0"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Call API mutation here
                setActionModal(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                actionModal === 'delete' ? 'bg-rose-600 hover:bg-rose-700 text-white' :
                actionModal === 'lock' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              Confirm {actionModal === 'lock' ? 'Lock' : actionModal === 'unlock' ? 'Unlock' : 'Delete'}
            </button>
          </>
        }
      >
        <div className="text-sm text-gray-300">
          {actionModal === 'delete' && (
            <p className="text-rose-400 mb-2">Warning: This action cannot be undone. All user data, jobs, and generated videos will be permanently removed.</p>
          )}
          {actionModal === 'lock' && (
            <p>The user will be immediately logged out and prevented from signing in until their account is unlocked.</p>
          )}
          {actionModal === 'unlock' && (
            <p>The user will regain full access to the platform according to their current plan.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
