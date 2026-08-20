import React from 'react';
import { Network, Server, Radio, Activity, ShieldAlert } from 'lucide-react';
import { NetworkTopology } from '../types';
import { TopologyMap } from '../network-map/TopologyMap';

interface NetworkMapPageProps {
  topology: NetworkTopology;
}

export const NetworkMapPage: React.FC<NetworkMapPageProps> = ({ topology }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wider">
              Metropolitan Telecom Grid & Core Topology
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 5G gNodeB Cells, Edge Routers, Core Gateways & Backhaul Links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Physical Sites: </span>
            <span className="text-cyan-400 font-bold">{topology.sites.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Active Cells: </span>
            <span className="text-cyan-400 font-bold">{topology.cells.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Core Nodes: </span>
            <span className="text-purple-400 font-bold">{topology.nodes.length}</span>
          </div>
        </div>
      </div>

      {/* Full Map Canvas */}
      <TopologyMap topology={topology} />
    </div>
  );
};
