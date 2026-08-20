import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Sparkles, X, Minimize2, Maximize2, Send, 
  Bot, User, BookOpen, ShieldCheck, RefreshCw, MessageSquare
} from 'lucide-react';
import { api } from '../services/api';

interface SunnyMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

export const SunnyAIWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SunnyMessage[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **Sunny**, your dedicated AI Project Guide for **Network Investigator**.\n\nAsk me anything about our architecture, multi-dimensional correlation formula, 5 forensic pillars, real-time database, live simulation scenarios, or how to present this for the **Zenus Group** selection!",
      citations: ["Network Investigator Overview"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickChips = [
    'What is Network Investigator?',
    'How does the correlation formula work?',
    'Explain the 5 forensic pillars',
    'How do I demo Scenario 1 (Config Failure)?',
    'What tech stack is used?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: SunnyMessage = {
      role: 'user',
      content: textToSend,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.chatWithSunny(textToSend);
      const assistantMsg: SunnyMessage = {
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I had trouble retrieving from the project knowledge base. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button (Collapsed State) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-400 p-[2px] shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Chat with Sunny — Project RAG AI Guide"
        >
          {/* Inner Circle */}
          <div className="w-full h-full bg-[#080D1A] rounded-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500 animate-spin-slow" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute top-2 right-2 animate-pulse" />
          </div>

          {/* Pulse Beacon */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#070B14] rounded-full animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#070B14] rounded-full" />

          {/* Hover Tooltip */}
          <div className="absolute right-16 top-2 hidden group-hover:flex items-center px-3 py-1.5 rounded-xl bg-slate-900/95 border border-amber-500/40 text-xs font-mono text-slate-100 whitespace-nowrap shadow-xl backdrop-blur-md">
            <span className="text-amber-400 font-bold mr-1">Sunny:</span>
            <span>Ask me anything about this project!</span>
          </div>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[580px] rounded-3xl glass-panel border border-amber-500/40 bg-[#080D1A]/95 shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-2xl">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#120E22] via-[#0E1528] to-[#0A1020] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-cyan-400 p-[1.5px] shadow-md shadow-amber-500/30">
                <div className="w-full h-full bg-[#090E1A] rounded-xl flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1">
                    Sunny <span className="text-amber-400">AI</span>
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    RAG • PROJECT SCOPE
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Network Investigator Intelligent Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-amber-300 text-slate-300 border border-slate-800 whitespace-nowrap transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message History Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-mono text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
                        : 'bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 font-sans text-xs leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-cyan-950/70 text-slate-100 border border-cyan-500/40'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1 text-[10px] font-mono text-slate-400">
                        <BookOpen className="w-3 h-3 text-amber-400 mr-1" />
                        <span>Citations: {msg.citations.join(', ')}</span>
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-slate-500 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs p-2">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Sunny is retrieving from project knowledge base...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Guardrail Disclaimer */}
          <div className="px-4 py-1.5 bg-slate-950/90 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-center">
            🔒 Sunny is strictly scoped to answer only regarding the Network Investigator project.
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#0A0E1A] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Sunny: e.g. How does the correlation formula work?"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none text-xs text-slate-100 placeholder-slate-500 font-sans"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
