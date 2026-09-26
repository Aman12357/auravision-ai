import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Copy, Wand2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  type: 'textarea' | 'select' | 'buttons';
  options?: string[];
  placeholder?: string;
}

const STEPS: Step[] = [
  {
    id: 'scene',
    title: 'Scene Description',
    description: 'What is the main action or subject?',
    type: 'textarea',
    placeholder: 'A futuristic city at night with flying cars...'
  },
  {
    id: 'subject',
    title: 'Subject Details',
    description: 'Describe characters or main objects in detail.',
    type: 'textarea',
    placeholder: 'A cyberpunk protagonist wearing a glowing jacket, detailed face, photorealistic...'
  },
  {
    id: 'environment',
    title: 'Environment & Setting',
    description: 'Where does this take place?',
    type: 'textarea',
    placeholder: 'Neon lit streets, raining, reflections on the ground, towering skyscrapers...'
  },
  {
    id: 'camera',
    title: 'Camera & Cinematography',
    description: 'How is it shot?',
    type: 'buttons',
    options: ['Wide angle shot', 'Close up portrait', 'Drone view', 'Low angle', 'Dutch angle', 'Tracking shot', 'Macro', 'Cinematic pan']
  },
  {
    id: 'style',
    title: 'Style & Mood',
    description: 'What is the visual style and feeling?',
    type: 'buttons',
    options: ['Cinematic', 'Cyberpunk', 'Ghibli Studio', 'Unreal Engine 5', 'Photorealistic', 'Oil painting', 'Dark and moody', 'Ethereal and dreamy']
  }
];

export function PromptBuilder({ onUsePrompt }: { onUsePrompt: (prompt: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [copied, setCopied] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleAnswer = (val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [STEPS[currentStep].id]: val }));
  };

  const toggleOption = (opt: string) => {
    const current = (answers[STEPS[currentStep].id] as string[]) || [];
    if (current.includes(opt)) {
      handleAnswer(current.filter(i => i !== opt));
    } else {
      handleAnswer([...current, opt]);
    }
  };

  const assembledPrompt = Object.values(answers)
    .flat()
    .filter(Boolean)
    .join(', ');

  const handleCopy = () => {
    navigator.clipboard.writeText(assembledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const step = STEPS[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0F172A] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400">
            <Wand2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Prompt Builder</h2>
            <p className="text-sm text-slate-400">Craft the perfect prompt step by step</p>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Step {currentStep + 1} of {STEPS.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800">
        <motion.div 
          className="h-full bg-violet-500" 
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[250px]"
          >
            <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-400 mb-6">{step.description}</p>

            {step.type === 'textarea' && (
              <textarea
                value={(answers[step.id] as string) || ''}
                onChange={e => handleAnswer(e.target.value)}
                placeholder={step.placeholder}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
              />
            )}

            {step.type === 'buttons' && (
              <div className="flex flex-wrap gap-3">
                {step.options?.map(opt => {
                  const isSelected = ((answers[step.id] as string[]) || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        isSelected 
                          ? "bg-violet-600 border-violet-500 text-white" 
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400"
          >
            Back
          </button>
          
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => onUsePrompt(assembledPrompt)}
              disabled={!assembledPrompt}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Use This Prompt
            </button>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-slate-900 p-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Type size={16} /> Prompt Preview
          </h4>
          <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
        <div className="p-4 bg-[#0F172A] rounded-lg border border-slate-800 text-sm text-slate-300 min-h-[80px] break-words">
          {assembledPrompt || <span className="text-slate-600 italic">Your generated prompt will appear here...</span>}
        </div>
      </div>
    </div>
  );
}
