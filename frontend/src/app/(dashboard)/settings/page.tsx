'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, AlertTriangle, Smartphone, Monitor } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-500' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <nav className="space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                    : `text-gray-400 hover:bg-gray-800 hover:text-gray-200 ${tab.color || ''}`
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8"
        >
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Profile Information</h2>
                <p className="text-sm text-gray-400 mb-6">Update your personal details and public profile.</p>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700">
                    Upload new avatar
                  </button>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <input type="text" defaultValue="John Doe" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                    <input type="email" defaultValue="john@example.com" disabled className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed opacity-70" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
                    <textarea rows={3} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"></textarea>
                  </div>
                  <button className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors mt-4">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Change Password</h2>
                <p className="text-sm text-gray-400 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                <div className="space-y-4 max-w-xl">
                  <input type="password" placeholder="Current password" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                  <input type="password" placeholder="New password" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                  <input type="password" placeholder="Confirm new password" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" />
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700">Update Password</button>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <h2 className="text-xl font-bold text-white mb-1">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-400 mb-4">Add additional security to your account using two factor authentication.</p>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Authenticator App</h4>
                    <p className="text-sm text-gray-400">Not configured</p>
                  </div>
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">Enable</button>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Active Sessions</h2>
                <div className="space-y-3">
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Monitor className="text-gray-400" />
                      <div>
                        <h4 className="text-white text-sm font-medium flex items-center gap-2">Windows 11 • Chrome <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Current</span></h4>
                        <p className="text-xs text-gray-500">New York, USA • 192.168.1.1</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Smartphone className="text-gray-400" />
                      <div>
                        <h4 className="text-white text-sm font-medium">iPhone 14 • Safari</h4>
                        <p className="text-xs text-gray-500">New York, USA • Active 2 days ago</p>
                      </div>
                    </div>
                    <button className="text-sm text-red-400 hover:text-red-300 font-medium">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { title: 'Video Generation Complete', desc: 'Receive an email when your video is ready.' },
                  { title: 'Payment Updates', desc: 'Invoices, receipts and payment failures.' },
                  { title: 'Team Invitations', desc: 'When someone invites you to a workspace.' },
                  { title: 'Product Updates', desc: 'New features and announcements.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-violet-500 rounded-xl p-4 bg-gray-950 cursor-pointer">
                  <div className="h-20 bg-gray-900 rounded border border-gray-800 mb-3 flex items-center justify-center">
                    <span className="text-white text-xs">Dark Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-4 border-violet-500 bg-gray-950"></div>
                    <span className="text-sm font-medium text-white">Dark</span>
                  </div>
                </div>
                {/* Light mode stub */}
                <div className="border border-gray-800 rounded-xl p-4 bg-gray-950 cursor-pointer opacity-50">
                  <div className="h-20 bg-white rounded border border-gray-200 mb-3 flex items-center justify-center">
                    <span className="text-gray-900 text-xs">Light Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-600 bg-transparent"></div>
                    <span className="text-sm font-medium text-gray-400">Light</span>
                  </div>
                </div>
                {/* System mode stub */}
                <div className="border border-gray-800 rounded-xl p-4 bg-gray-950 cursor-pointer opacity-50">
                  <div className="h-20 bg-gradient-to-r from-gray-900 to-white rounded border border-gray-800 mb-3"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-gray-600 bg-transparent"></div>
                    <span className="text-sm font-medium text-gray-400">System</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div>
              <h2 className="text-xl font-bold text-red-500 mb-1">Danger Zone</h2>
              <p className="text-sm text-gray-400 mb-6">Irreversible and destructive actions.</p>
              
              <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-6">
                <h3 className="text-white font-medium mb-2">Delete Account</h3>
                <p className="text-sm text-gray-300 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Delete Account
                </button>
              </div>

              <div className="border border-gray-800 rounded-xl p-6 mt-6">
                <h3 className="text-white font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-400 mb-4">Download all information associated with your account.</p>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700">
                  Request Export
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
