import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ForensicEventNode } from './ForensicEventNode';
import { Sparkles, Route, Filter, Info, X, Zap } from 'lucide-react';

interface ForensicIncidentGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onSelectNode?: (nodeData: any) => void;
}

const nodeTypes = {
  forensicEventNode: ForensicEventNode,
};

export const ForensicIncidentGraph: React.FC<ForensicIncidentGraphProps> = ({
  initialNodes,
  initialEdges,
  onSelectNode,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Update nodes when initialNodes changes
  React.useEffect(() => {
    // Style edges nicely with cyan glow and animated arrows
    const styledEdges = initialEdges.map((e) => ({
      ...e,
      animated: true,
      style: {
        stroke: '#06B6D4',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#06B6D4',
      },
      labelStyle: {
        fill: '#94A3B8',
        fontSize: 10,
        fontFamily: 'monospace',
      },
      labelBgStyle: {
        fill: '#0F172A',
        stroke: '#1E293B',
      },
    }));

    setNodes(initialNodes);
    setEdges(styledEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeData(node.data);
      if (onSelectNode) {
        onSelectNode(node.data);
      }
    },
    [onSelectNode]
  );

  const highlightRootCause = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isRoot = (node.data as any).isRootCauseCandidate;
        return {
          ...node,
          selected: isRoot,
        };
      })
    );
  }, [setNodes]);

  const filteredNodes = useMemo(() => {
    if (severityFilter === 'ALL') return nodes;
    return nodes.filter((n) => (n.data as any).severity === severityFilter);
  }, [nodes, severityFilter]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#080C16]">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <button
          onClick={highlightRootCause}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-500/40 text-xs font-mono transition-all shadow-md shadow-purple-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Highlight Root Cause</span>
        </button>

        {/* Severity Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-lg text-xs font-mono">
          <Filter className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Badge */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Critical Anomaly</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Root Trigger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Propagation Vector</span>
        </div>
      </div>

      {/* React Flow Viewport */}
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1E293B" />
        <Controls className="!bg-slate-900/90 !border-slate-800 !text-slate-300 fill-slate-300" />
        <MiniMap
          nodeColor={(n: any) => {
            if (n.data?.isRootCauseCandidate) return '#A855F7';
            if (n.data?.severity === 'CRITICAL') return '#F43F5E';
            if (n.data?.severity === 'HIGH') return '#F59E0B';
            return '#06B6D4';
          }}
          className="!bg-slate-950/80 !border-slate-800 rounded-lg"
          maskColor="rgba(7, 11, 20, 0.7)"
        />
      </ReactFlow>

      {/* Node Detail Drawer / Inspection Panel */}
      {selectedNodeData && (
        <div className="absolute bottom-4 right-4 z-20 w-80 p-4 rounded-xl glass-panel border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-100">
                Node Telemetry Detail
              </h4>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Component:</span>
              <span className="font-mono font-bold text-cyan-400">{selectedNodeData.component}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Event Type:</span>
              <span className="font-mono text-purple-300">{selectedNodeData.eventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Severity:</span>
              <span className="font-mono font-bold text-rose-400">{selectedNodeData.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="font-mono text-slate-300">{selectedNodeData.timestamp}</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block mb-1">Description:</span>
              <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800 font-mono text-[11px]">
                {selectedNodeData.description}
              </p>
            </div>
            {selectedNodeData.metricName && (
              <div className="flex justify-between bg-cyan-950/40 p-2 rounded border border-cyan-500/20 font-mono">
                <span className="text-slate-300">{selectedNodeData.metricName}:</span>
                <span className="text-cyan-300 font-bold">
                  {selectedNodeData.metricValue} {selectedNodeData.metricUnit}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
