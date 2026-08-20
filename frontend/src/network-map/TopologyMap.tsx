import React, { useState, useMemo } from 'react';
import { 
  Radio, Network, Server, ShieldAlert, Cpu, 
  Layers, Navigation, AlertTriangle, CheckCircle2, Zap
} from 'lucide-react';
import { NetworkTopology, PropagationStep } from '../types';

interface TopologyMapProps {
  topology: NetworkTopology;
  highlightComponent?: string;
  propagationPath?: PropagationStep[];
  investigationMode?: boolean;
  onSelectComponent?: (comp: any) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  topology,
  highlightComponent,
  propagationPath = [],
  investigationMode = false,
  onSelectComponent,
}) => {
  const [selectedComp, setSelectedComp] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | '5G' | 'ROUTERS' | 'AFFECTED'>('ALL');

  // Identify affected components from propagation path
  const affectedCompNames = useMemo(() => {
    return new Set(propagationPath.map((p) => p.component));
  }, [propagationPath]);

  // SVG coordinate layout mapping for sites and cells
  const layoutPositions: Record<string, { x: number; y: number }> = {
    'SITE-METRO-01': { x: 380, y: 280 },
    'CELL-A17': { x: 320, y: 200 },
    'CELL-B12': { x: 440, y: 200 },
    'CELL-C04': { x: 380, y: 360 },
    'ROUTER-A': { x: 380, y: 280 },

    'SITE-NORTH-02': { x: 640, y: 160 },
    'CELL-D09': { x: 600, y: 90 },
    'CELL-E21': { x: 700, y: 140 },
    'ROUTER-NORTH-01': { x: 640, y: 160 },

    'SITE-WEST-03': { x: 180, y: 380 },
    'CELL-F08': { x: 120, y: 360 },
    'CELL-G15': { x: 190, y: 460 },
    'ROUTER-WEST-01': { x: 180, y: 380 },

    'SITE-SOUTH-04': { x: 380, y: 520 },
    'CELL-H33': { x: 380, y: 560 },

    'SITE-EAST-05': { x: 740, y: 380 },
    'CELL-I02': { x: 760, y: 420 },

    'CORE-NODE-01': { x: 500, y: 320 },
    'UPF-GATEWAY-01': { x: 600, y: 340 }
  };

  const handleCompClick = (comp: any, type: string) => {
    const enriched = { ...comp, compType: type };
    setSelectedComp(enriched);
    if (onSelectComponent) {
      onSelectComponent(enriched);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#060911]">
      {/* Top Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-xs font-mono backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {[
            { id: 'ALL', label: 'All Grid' },
            { id: '5G', label: '5G NR Sectors' },
            { id: 'ROUTERS', label: 'Core / Routers' },
            { id: 'AFFECTED', label: 'Blast Radius' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {investigationMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-mono animate-pulse shadow-md shadow-purple-500/20">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>INVESTIGATION BLAST RADIUS MODE</span>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex flex-col gap-1.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
          <span>5G gNodeB Cell</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-purple-500 shadow-sm shadow-purple-500/50" />
          <span>Edge Router</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span>Incident Origin (Origin Root)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-cyan-500 border-dashed" />
          <span>Radio / Fiber Link</span>
        </div>
      </div>

      {/* SVG Topology Canvas */}
      <svg
        viewBox="0 0 920 620"
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
      >
        {/* Background Grid Lines & Concentric Radar Rings */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.3)" strokeWidth="1" />
          </pattern>
          <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.4)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Site Regions & Outer Circles */}
        {topology.sites.map((site) => {
          const pos = layoutPositions[site.id] || { x: 450, y: 300 };
          return (
            <g key={site.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="110"
                fill="rgba(15, 23, 42, 0.25)"
                stroke="rgba(56, 189, 248, 0.15)"
                strokeDasharray="4 4"
              />
              <text
                x={pos.x}
                y={pos.y + 90}
                textAnchor="middle"
                className="fill-slate-500 font-mono text-[10px] uppercase tracking-wider"
              >
                {site.site_name}
              </text>
            </g>
          );
        })}

        {/* Links between Nodes */}
        {topology.links.map((link) => {
          const p1 = layoutPositions[link.source] || { x: 300, y: 300 };
          const p2 = layoutPositions[link.target] || { x: 500, y: 300 };
          const isAffectedLink = affectedCompNames.has(link.source) && affectedCompNames.has(link.target);

          return (
            <line
              key={link.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={
                isAffectedLink
                  ? '#F43F5E'
                  : link.link_type === 'CORE_TRUNK'
                  ? '#A855F7'
                  : '#06B6D4'
              }
              strokeWidth={isAffectedLink ? 3 : link.link_type === 'CORE_TRUNK' ? 2.5 : 1.5}
              strokeDasharray={isAffectedLink ? '6 4' : link.link_type === 'RADIO_NEIGHBOR' ? '4 3' : 'none'}
              strokeOpacity={isAffectedLink ? 0.9 : 0.4}
              className={isAffectedLink ? 'animate-pulse' : ''}
            />
          );
        })}

        {/* Render Core Nodes & Routers */}
        {topology.nodes.map((node) => {
          if (activeFilter === '5G') return null;
          const pos = layoutPositions[node.id] || { x: 450, y: 300 };
          const isAffected = affectedCompNames.has(node.id);
          const isOrigin = highlightComponent === node.id;

          return (
            <g
              key={node.id}
              onClick={() => handleCompClick(node, 'NODE')}
              className="cursor-pointer group"
            >
              {isOrigin && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="36"
                  fill="url(#originGlow)"
                  className="animate-ping"
                />
              )}
              <rect
                x={pos.x - 18}
                y={pos.y - 18}
                width="36"
                height="36"
                rx="8"
                fill={
                  isOrigin
                    ? '#881337'
                    : isAffected
                    ? '#4C0519'
                    : node.node_type === 'CORE_SWITCH'
                    ? '#3B0764'
                    : '#0F172A'
                }
                stroke={
                  isOrigin
                    ? '#F43F5E'
                    : isAffected
                    ? '#FB7185'
                    : node.node_type === 'CORE_SWITCH'
                    ? '#C084FC'
                    : '#38BDF8'
                }
                strokeWidth="2"
                className="transition-all duration-300 group-hover:scale-110"
              />
              <Server
                x={pos.x - 9}
                y={pos.y - 9}
                className={`w-4.5 h-4.5 ${
                  isOrigin ? 'text-rose-300' : isAffected ? 'text-rose-400' : 'text-cyan-300'
                }`}
              />
              <text
                x={pos.x}
                y={pos.y + 30}
                textAnchor="middle"
                className="fill-slate-200 font-mono text-[11px] font-bold"
              >
                {node.id}
              </text>
            </g>
          );
        })}

        {/* Render Cells */}
        {topology.cells.map((cell) => {
          if (activeFilter === 'ROUTERS') return null;
          const pos = layoutPositions[cell.id] || { x: 300, y: 200 };
          const isAffected = affectedCompNames.has(cell.id);
          const isOrigin = highlightComponent === cell.id;

          return (
            <g
              key={cell.id}
              onClick={() => handleCompClick(cell, 'CELL')}
              className="cursor-pointer group"
            >
              {isOrigin && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="34"
                  fill="url(#originGlow)"
                  className="animate-ping"
                />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r="16"
                fill={isOrigin ? '#BE123C' : isAffected ? '#881337' : '#0E7490'}
                stroke={isOrigin ? '#FB7185' : isAffected ? '#F43F5E' : '#22D3EE'}
                strokeWidth="2"
                className="transition-all duration-300 group-hover:scale-125"
              />
              <Radio
                x={pos.x - 7}
                y={pos.y - 7}
                className="w-3.5 h-3.5 text-white"
              />
              <text
                x={pos.x}
                y={pos.y + 26}
                textAnchor="middle"
                className="fill-slate-300 font-mono text-[10px] font-bold"
              >
                {cell.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Component Inspection Floating Panel */}
      {selectedComp && (
        <div className="absolute bottom-4 left-4 z-20 w-80 p-4 rounded-xl glass-panel border border-cyan-500/30 text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2.5">
            <span className="font-mono font-bold text-cyan-400 uppercase tracking-wider">
              {selectedComp.id}
            </span>
            <button
              onClick={() => setSelectedComp(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="text-slate-200">{selectedComp.cell_name || selectedComp.node_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="text-purple-300">{selectedComp.technology || selectedComp.node_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-bold ${
                selectedComp.status === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {selectedComp.status}
              </span>
            </div>
            {selectedComp.ip_address && (
              <div className="flex justify-between">
                <span className="text-slate-400">IP:</span>
                <span className="text-slate-300">{selectedComp.ip_address}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
