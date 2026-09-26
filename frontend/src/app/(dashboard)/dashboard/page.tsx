'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, ShieldCheck, RefreshCw, CheckCircle2, Video, HardDrive, Sparkles, User } from 'lucide-react';
import { AuraVideoStudio } from '@/components/studio/AuraVideoStudio';

interface GmailMessage {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('creator.aura.ai@gmail.com');

  const fetchGmailMessages = async () => {
    setLoadingGmail(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/gmail/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setUserEmail(data.userEmail || 'creator.aura.ai@gmail.com');
      }
    } catch (err) {
      console.error('Failed to fetch Gmail messages:', err);
    } finally {
      setLoadingGmail(false);
    }
  };

  useEffect(() => {
    fetchGmailMessages();
    const storedEmail = localStorage.getItem('aura_user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Google Session Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#131320] via-[#1a1a2e] to-[#131320] border border-[#4893FC]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4893FC]/15 border border-[#4893FC]/30 flex items-center justify-center text-[#4893FC] font-bold text-lg">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-white">Welcome, {userEmail.split('@')[0]}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={12} /> Google OAuth 2.0 Connected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Active account: <span className="text-slate-200 font-mono">{userEmail}</span> • Gmail Read-only API authorized
            </p>
          </div>
        </div>

        <a 
          href="http://localhost:5000/login/google"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} /> Re-authenticate Google
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#131320] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Videos Generated</CardTitle>
            <Video size={16} className="text-[#4893FC]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">128</div>
            <p className="text-xs text-slate-500 mt-1">+14 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-[#131320] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Credits Available</CardTitle>
            <Sparkles size={16} className="text-[#969DFF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">950</div>
            <p className="text-xs text-slate-500 mt-1">Pro Plan Active</p>
          </CardContent>
        </Card>

        <Card className="bg-[#131320] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Authorized Gmails</CardTitle>
            <Mail size={16} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{messages.length}</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Syncing live
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#131320] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage Used</CardTitle>
            <HardDrive size={16} className="text-[#BD99FE]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1.2 GB</div>
            <p className="text-xs text-slate-500 mt-1">100 GB Cloud Limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Video Generation Studio */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-[#4893FC]" /> AI Video Generation Studio
          </h3>
          <span className="text-xs text-slate-400">Connected to 60FPS PyTorch Synthesizer Engine</span>
        </div>

        <AuraVideoStudio />
      </div>

      {/* Authorized Gmail Messages Inbox Card */}
      <Card className="bg-[#131320] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Mail size={20} className="text-[#4893FC]" /> Authorized Gmail Messages
            </CardTitle>
            <p className="text-xs text-slate-400">
              Displaying messages synced via Google OAuth 2.0 (<span className="text-slate-300">{userEmail}</span>)
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchGmailMessages} 
            disabled={loadingGmail}
            className="text-xs flex items-center gap-1.5 border-white/10 hover:bg-white/5"
          >
            <RefreshCw size={14} className={loadingGmail ? "animate-spin" : ""} /> Refresh
          </Button>
        </CardHeader>
        
        <CardContent>
          {loadingGmail ? (
            <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-[#4893FC]" />
              Reading authorized Gmail messages...
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-slate-400 text-sm">No authorized emails found in inbox.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      {msg.unread && <span className="w-2 h-2 rounded-full bg-[#4893FC]" />}
                      {msg.sender}
                    </span>
                    <span className="text-slate-500">{msg.date}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-[#4893FC] transition-colors">
                    {msg.subject}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {msg.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
