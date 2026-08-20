import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, User, Send, Sparkles, CornerDownLeft, 
  HelpCircle, RefreshCw, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import { AIChatMessage } from '../types';
import { api } from '../services/api';

interface AIInvestigatorChatProps {
  incidentId?: string;
  incidentNumber?: string;
}

export const AIInvestigatorChat: React.FC<AIInvestigatorChatProps> = ({
  incidentId,
  incidentNumber,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: `I am your **AI Telecom Forensic Investigator**. I have correlated the live alarms, telemetry metrics, and topology links for **${incidentNumber || 'the network'}**.\n\nYou can ask me why specific components failed, inspect the evidence trail, or evaluate counterfactual hypotheses.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedChips = [
    'Why is this the primary root cause?',
    'Show me the strongest evidence trail',
    'What happened in the first 30 seconds?',
    'Could external traffic surge explain this?',
    'What are the recommended engineer actions?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.chatWithAI(textToSend, incidentId, messages);
      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error communicating with the forensic reasoning core. Please verify backend connectivity.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] rounded-2xl glass-panel border border-cyan-500/20 bg-slate-950/80 overflow-hidden">
      {/* Chat Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#0A0E1A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                Forensic AI Detective
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300">
                DATA GROUNDED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Conversational root cause analysis & evidence interrogation
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-1" />
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 hover:text-cyan-300 text-slate-400 border border-slate-800 whitespace-nowrap transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
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
                    : 'bg-purple-950 border border-purple-500/40 text-purple-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 font-sans leading-relaxed text-xs shadow-md ${
                  isUser
                    ? 'bg-cyan-950/60 text-slate-100 border border-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-200 border border-slate-800/90'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                {msg.timestamp && (
                  <div className="text-[10px] font-mono text-slate-500 mt-2 text-right">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 font-mono text-xs p-2">
            <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>AI Investigator formulating forensic reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
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
          placeholder="Ask AI Detective: e.g. Why did Cell A17 trigger call drops? Show evidence..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs text-slate-100 placeholder-slate-500 font-sans"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
