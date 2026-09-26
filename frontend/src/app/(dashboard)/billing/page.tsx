'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  CreditCard, 
  Download, 
  Zap, 
  Clock, 
  Shield, 
  Star 
} from 'lucide-react';

const plans = [
  { name: 'Free', price: '$0', credits: 50, features: ['720p Resolution', 'Max 5s duration', 'Standard support'], current: false },
  { name: 'Starter', price: '$15', credits: 500, features: ['1080p Resolution', 'Max 15s duration', 'Priority support', 'No watermarks'], current: true },
  { name: 'Pro', price: '$49', credits: 2000, features: ['4K Resolution', 'Max 60s duration', '24/7 support', 'Custom models'], current: false },
  { name: 'Enterprise', price: 'Custom', credits: 'Unlimited', features: ['8K Resolution', 'API Access', 'Dedicated account manager', 'SLA'], current: false },
];

const transactions = [
  { id: 1, date: '2023-10-25', type: 'Credit Purchase', description: 'Bought 500 credits pack', amount: '+500', balance: '1200' },
  { id: 2, date: '2023-10-24', type: 'Video Generation', description: 'Generated "Cinematic Sunrise"', amount: '-50', balance: '700' },
  { id: 3, date: '2023-10-20', type: 'Subscription', description: 'Monthly Pro Plan Renewal', amount: '+2000', balance: '750' },
];

const creditPacks = [
  { credits: 500, price: '$4.99' },
  { credits: 2000, price: '$14.99' },
  { credits: 10000, price: '$49.99' },
];

export default function BillingPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
      </motion.div>

      {/* Current Plan Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-semibold text-white">Current Plan: Starter</h2>
            <span className="px-3 py-1 bg-violet-600/20 text-violet-400 rounded-full text-sm font-medium border border-violet-600/30">Active</span>
          </div>
          <p className="text-gray-400">Renews on November 25, 2023 for $15.00</p>
          <div className="mt-6 flex gap-4">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-700">Cancel Plan</button>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-violet-600/20">Update Payment Method</button>
          </div>
        </div>
        <div className="flex items-center gap-8 bg-gray-950 p-6 rounded-xl border border-gray-800">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-violet-500" strokeDasharray="60, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-white">300</span>
              <span className="text-xs text-gray-400">/ 500</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Credits Remaining</h3>
            <p className="text-sm text-gray-400">Resets in 12 days</p>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} 
              className={`rounded-2xl border p-6 flex flex-col ${plan.current ? 'bg-gray-900 border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.1)]' : 'bg-gray-900/50 border-gray-800'}`}>
              {plan.current && <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 block">Current Plan</span>}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-gray-400">/mo</span>}
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-6 border border-gray-800">
                <p className="text-sm font-medium text-gray-300">{plan.credits} Credits / month</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-2.5 rounded-lg font-medium transition-colors ${plan.current ? 'bg-gray-800 text-gray-300 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                {plan.current ? 'Active' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Buy Credits */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Buy Extra Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPacks.map((pack, i) => (
            <motion.div key={pack.credits} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:border-violet-500/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-600/20 text-violet-400 rounded-full flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{pack.credits} Credits</h4>
                  <p className="text-gray-400 text-sm">One-time purchase</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white block">{pack.price}</span>
                <button className="text-sm text-violet-400 hover:text-violet-300 font-medium mt-1">Purchase</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Transaction History</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-950 text-gray-300 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-300">{t.type}</td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-bold ${t.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{t.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{t.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
