import React, { useState, useEffect } from 'react';
import { 
  Database, Upload, CheckCircle2, AlertCircle, 
  FileText, Activity, Radio, RefreshCw, Server
} from 'lucide-react';
import { api } from '../services/api';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const data = await api.getDataSources();
        setSources(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSources();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const res = await api.uploadData(uploadFile);
      setUploadResult(res);
      setUploadFile(null);
    } catch (err: any) {
      setUploadResult({ status: 'error', detail: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-[#090D18] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wider">
              Telemetry Ingestion Connectors & Data Lake
            </h2>
            <p className="text-xs text-slate-400">
              Live ingest pipelines for SNMP Traps, gNMI/gRPC metrics, sFlow packets, and custom files
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Data Source Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-4 rounded-2xl glass-panel border border-slate-800 bg-[#0A0E1C] flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {src.id}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {src.status}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold font-mono text-slate-100 mb-1">
                {src.name}
              </h3>
              <div className="text-[11px] font-mono text-slate-400">
                Protocol: <span className="text-slate-300">{src.protocol}</span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] font-mono pt-2 border-t border-slate-800 text-slate-400">
              <span>Rate: <strong className="text-cyan-300">{src.events_per_sec} eps</strong></span>
              <span>Latency: <strong className="text-emerald-400">{src.latency_ms} ms</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* File Ingestion Dropzone & Manual Uploader */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 bg-[#090D18] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Upload className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
            Manual Telecom Ingestion (CSV / JSON / Syslog / Netflow)
          </h3>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-8 text-center transition-all bg-slate-950/60">
            <FileText className="w-10 h-10 text-cyan-400/80 mx-auto mb-3" />
            <p className="text-xs font-mono text-slate-300 mb-1">
              Select or drop network event files (.json, .csv, or .log)
            </p>
            <p className="text-[11px] text-slate-500 mb-4 font-sans">
              The engine will parse timestamps, normalize severities, and initiate real-time correlation.
            </p>
            <input
              type="file"
              accept=".json,.csv,.log,.txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-cyan-500 file:text-slate-950 file:font-bold hover:file:bg-cyan-400 cursor-pointer"
            />
          </div>

          {uploadFile && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-cyan-300 font-bold">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold shadow-md shadow-cyan-500/20 transition-all"
              >
                {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Ingest & Correlate Now</span>
              </button>
            </div>
          )}
        </form>

        {uploadResult && (
          <div className={`p-4 rounded-xl border text-xs font-mono ${
            uploadResult.status === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            {uploadResult.status === 'success' ? (
              <div>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Successfully ingested {uploadResult.events_ingested} network events!
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Incidents automatically clustered: {uploadResult.incidents_detected}. Real-time correlation updated.
                </p>
              </div>
            ) : (
              <div>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Ingestion Error
                </div>
                <p className="text-[11px] text-slate-300 font-sans">{uploadResult.detail}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
