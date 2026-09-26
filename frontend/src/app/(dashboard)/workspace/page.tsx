'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, HardDrive, Zap, Edit2, UserPlus, X, ChevronDown } from 'lucide-react';

const members = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Owner', joined: '2023-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', joined: '2023-03-22' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Member', joined: '2023-08-10' },
];

export default function WorkspacePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20 text-3xl font-bold text-white">
            A
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">Acme Corp AI</h1>
              <span className="px-3 py-1 bg-violet-600/20 text-violet-400 rounded-full text-xs font-medium border border-violet-600/30 uppercase tracking-wide">Pro Plan</span>
            </div>
            <p className="text-gray-400 font-mono text-sm">slug: acme-corp-ai</p>
          </div>
        </div>
        <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700">
          <Edit2 className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Users className="w-5 h-5 text-blue-400" /></div>
            <h3 className="text-gray-300 font-medium">Team Members</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">3 <span className="text-lg text-gray-500 font-normal">/ 10</span></p>
          <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '30%' }}></div></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-500/20 rounded-lg"><Zap className="w-5 h-5 text-violet-400" /></div>
            <h3 className="text-gray-300 font-medium">Credits Used</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">1,250 <span className="text-lg text-gray-500 font-normal">/ 2000</span></p>
          <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '62%' }}></div></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg"><HardDrive className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="text-gray-300 font-medium">Storage</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">45 GB <span className="text-lg text-gray-500 font-normal">/ 100 GB</span></p>
          <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
        </motion.div>
      </div>

      {/* Members Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Members</h2>
        </div>

        {/* Invite Form */}
        <div className="flex gap-4 mb-8 bg-gray-950 p-4 rounded-xl border border-gray-800">
          <input type="email" placeholder="Email address" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-violet-500" />
          <select className="bg-gray-900 border border-gray-700 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-violet-500">
            <option>Member</option>
            <option>Admin</option>
          </select>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-gray-800 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950 text-gray-400 font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/50">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-500 text-xs">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      {member.role}
                      {member.role !== 'Owner' && <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{member.joined}</td>
                  <td className="px-6 py-4 text-right">
                    {member.role !== 'Owner' && (
                      <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
