import React from 'react';
import { 
  ShieldAlert, Activity, Cpu, Network, History, FileText, 
  Database, Radio, PlayCircle, Wifi, AlertTriangle
} from 'lucide-react';
import { ConnectionStatus } from '../realtime/useRealtime';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  activeIncidentCount: number;
  liveEventCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  connectionStatus,
  isSimulating,
  activeIncidentCount,
  liveEventCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'live-network', label: 'Live Network & Sim', icon: Radio, badge: isSimulating ? 'LIVE' : undefined },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: activeIncidentCount > 0 ? `${activeIncidentCount}` : undefined },
    { id: 'investigation', label: 'Investigation Hub', icon: Cpu },
    { id: 'network-map', label: 'Topology Map', icon: Network },
    { id: 'historical', label: 'Historical Cases', icon: History },
    { id: 'reports', label: 'Dossier Reports', icon: FileText },
    { id: 'data-sources', label: 'Data Sources', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between">
        
        {/* Brand & Forensic Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090D16] rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            {isSimulating && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase font-mono">
                Network <span className="text-cyan-400">Investigator</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 font-mono">
                AI FORENSIC CORE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Digital Forensic Incident Reconstruction & Root Cause Analysis
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    item.badge === 'LIVE' 
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System State & Realtime Health Pill */}
        <div className="flex items-center gap-3">
          {/* Simulation status pill */}
          {isSimulating && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>SIMULATION ACTIVE</span>
            </div>
          )}

          {/* Realtime Database Connection Pill */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono border ${
            connectionStatus === 'CONNECTED'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : connectionStatus === 'CONNECTING'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-400 animate-pulse'
                : connectionStatus === 'CONNECTING'
                ? 'bg-amber-400 animate-spin'
                : 'bg-rose-400'
            }`} />
            <span className="hidden md:inline">REAL-TIME DB:</span>
            <span>{connectionStatus}</span>
          </div>
        </div>

      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center gap-1 mt-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
