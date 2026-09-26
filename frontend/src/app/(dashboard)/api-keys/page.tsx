'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Shield, Clock } from 'lucide-react';

const apiKeys = [
  { id: 1, name: 'Production App', prefix: 'sk_live_abc123', scopes: ['VIDEO_GENERATE', 'VIDEO_VIEW'], lastUsed: '2 hours ago', created: '2023-09-10', status: 'Active' },
  { id: 2, name: 'Development Env', prefix: 'sk_test_xyz789', scopes: ['ALL'], lastUsed: '5 mins ago', created: '2023-10-01', status: 'Active' },
  { id: 3, name: 'Old Integration', prefix: 'sk_live_old456', scopes: ['VIDEO_VIEW'], lastUsed: '2 months ago', created: '2023-01-15', status: 'Disabled' },
];

export default function ApiKeysPage() {
  const [activeTab, setActiveTab] = useState('curl');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-gray-400">Manage your API keys for programmatic access to Aura AI.</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/20">
          <Plus className="w-4 h-4" /> Create New Key
        </button>
      </motion.div>

      {/* Keys Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-950 text-gray-400 font-medium border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Key Prefix</th>
              <th className="px-6 py-4">Scopes</th>
              <th className="px-6 py-4">Last Used</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {apiKeys.map(key => (
              <tr key={key.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{key.name}</td>
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{key.prefix}••••••••••</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {key.scopes.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] uppercase tracking-wider">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">{key.lastUsed}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    key.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {key.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Copy ID">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Code Snippets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-800">
          {['curl', 'javascript', 'python'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium uppercase tracking-wider ${
                activeTab === tab ? 'text-violet-400 border-b-2 border-violet-500 bg-gray-800/30' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6 relative">
          <button className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-gray-800 rounded border border-gray-700">
            <Copy className="w-4 h-4" />
          </button>
          <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
            {activeTab === 'curl' && `curl -X POST https://api.aura.ai/v1/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "X-Workspace-Id: YOUR_WORKSPACE_ID" \\
  -d '{"prompt": "Cinematic view of...", "jobType": "TEXT_TO_VIDEO"}'`}
            {activeTab === 'javascript' && `const response = await fetch('https://api.aura.ai/v1/jobs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'X-Workspace-Id': 'YOUR_WORKSPACE_ID'
  },
  body: JSON.stringify({
    prompt: "Cinematic view of...",
    jobType: "TEXT_TO_VIDEO"
  })
});
const data = await response.json();`}
            {activeTab === 'python' && `import requests

url = "https://api.aura.ai/v1/jobs"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
    "X-Workspace-Id": "YOUR_WORKSPACE_ID"
}
data = {
    "prompt": "Cinematic view of...",
    "jobType": "TEXT_TO_VIDEO"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
          </pre>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-4 items-start">
        <Shield className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-blue-100 font-medium mb-1">Rate Limits & Security</h4>
          <p className="text-sm text-blue-200/70">
            API requests are rate-limited to 60 requests per minute per IP address. Ensure you keep your API keys secure and do not expose them in client-side code. Use temporary scopes for restricted environments.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
