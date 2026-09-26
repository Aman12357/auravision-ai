'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, CheckCircle2, ChevronRight, Zap, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { workspaceApi } from '@/lib/api/workspace';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspaceData, setWorkspaceData] = useState({ name: '', description: '' });
  const [selectedPlan, setSelectedPlan] = useState('STARTER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => s + 1);

  const handleComplete = async () => {
    setIsSubmitting(true);
    // Simulate API call
    // await workspaceApi.createWorkspace(workspaceData);
    
    setTimeout(() => {
      setStep(4); // Success step
      setIsSubmitting(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress Indicator */}
      {step < 4 && (
        <div className="absolute top-10 w-full max-w-md px-6 flex items-center justify-center gap-2 z-10">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                step >= i ? "bg-violet-500" : "bg-slate-800"
              )} 
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg z-10 relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-violet-900/50">
                <Sparkles size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Welcome to Aura AI
              </h1>
              <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                The most powerful AI text-to-video generation platform. Let's set up your workspace to get started.
              </p>
              <button 
                onClick={handleNext}
                className="group flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-6 text-sm text-slate-500 hover:text-white transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {/* STEP 2: Workspace Setup */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-[#0F172A] p-8 rounded-2xl border border-slate-800 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg">
                  <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold">Create Workspace</h2>
              </div>
              
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Workspace Name</label>
                  <input 
                    type="text" 
                    value={workspaceData.name}
                    onChange={e => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                    placeholder="e.g. My Awesome Studio"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                  <textarea 
                    value={workspaceData.description}
                    onChange={e => setWorkspaceData({ ...workspaceData, description: e.target.value })}
                    placeholder="What will you create here?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-slate-700 hover:bg-slate-800 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!workspaceData.name.trim()}
                  className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center mb-2">Choose your plan</h2>
              <p className="text-slate-400 text-center mb-8">You can always upgrade later</p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { id: 'FREE', name: 'Free', price: '$0', credits: '100 credits/mo', features: ['720p Generation', 'Standard speed', 'Community support'] },
                  { id: 'STARTER', name: 'Starter', price: '$19', credits: '1,500 credits/mo', features: ['1080p Generation', 'Fast speed', 'Remove watermarks'], popular: true },
                  { id: 'PRO', name: 'Pro', price: '$49', credits: '5,000 credits/mo', features: ['4K Generation', 'Priority speed', 'Custom models'] }
                ].map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-6",
                      selectedPlan === plan.id ? "border-violet-500 bg-violet-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-cyan-500 text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedPlan === plan.id ? "border-violet-500" : "border-slate-600"
                    )}>
                      {selectedPlan === plan.id && <div className="w-3 h-3 bg-violet-500 rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <span className="text-xl font-bold">{plan.price}<span className="text-sm font-normal text-slate-400">/mo</span></span>
                      </div>
                      <p className="text-violet-400 font-medium text-sm mb-2"><Zap size={14} className="inline mr-1"/>{plan.credits}</p>
                      <div className="flex gap-4 text-xs text-slate-400">
                        {plan.features.slice(0, 2).map((f, i) => (
                          <span key={i} className="flex items-center gap-1"><Check size={12} className="text-green-500"/> {f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border border-slate-700 hover:bg-slate-800 rounded-xl font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-[2] flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Complete Setup <ChevronRight size={20} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 size={50} />
              </motion.div>
              <h2 className="text-4xl font-bold mb-4">You're All Set!</h2>
              <p className="text-slate-400 text-lg">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
