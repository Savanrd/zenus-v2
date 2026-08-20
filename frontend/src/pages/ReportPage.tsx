import React, { useRef } from 'react';
import { 
  FileText, Download, Printer, ArrowLeft, 
  ShieldAlert, Sparkles, CheckCircle2, Route, History, Cpu
} from 'lucide-react';
import { InvestigationReport } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportPageProps {
  report: InvestigationReport | null;
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ report, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!report) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-sm space-y-4">
        <p>No dossier report selected. Please generate a report from the Investigation Hub.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#070B14',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Network_Forensic_Dossier_${report.incident_number}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Dossier_${report.incident_number}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['StepNumber', 'Timestamp', 'Component', 'Severity', 'EventType', 'Description', 'Metric'];
    const rows = (report.timeline_events || []).map((ev, idx) => [
      idx + 1,
      `"${ev.timestamp}"`,
      `"${ev.network_component}"`,
      `"${ev.severity}"`,
      `"${ev.event_type}"`,
      `"${ev.description.replace(/"/g, '""')}"`,
      `"${ev.metric_name || ''}: ${ev.metric_value || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Timeline_Events_${report.incident_number}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800 bg-[#090D18]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-bold transition-all shadow-md shadow-purple-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Dossier</span>
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Printable / Rendered Dossier Sheet */}
      <div
        ref={reportRef}
        className="p-8 sm:p-12 rounded-3xl bg-[#090D18] border border-cyan-500/30 text-slate-200 shadow-2xl space-y-8 font-sans"
      >
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                OFFICIAL INCIDENT FORENSIC DOSSIER
              </span>
              <span className="text-xs font-mono text-slate-400">
                REF: {report.report_id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
              {report.title}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Generated by {report.generated_by} • {report.generated_at}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-right font-mono text-xs space-y-1">
            <div>Incident #: <strong className="text-cyan-400">{report.incident_number}</strong></div>
            <div>Severity: <strong className="text-rose-400">{report.severity}</strong></div>
            <div>Region: <strong className="text-slate-200">{report.region}</strong></div>
            <div>Duration: <strong className="text-emerald-400">{report.duration_str}</strong></div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-2">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400">
            1. Executive Forensic Summary
          </h3>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-200">
            {report.executive_summary}
          </div>
        </section>

        {/* 2. Root Cause Determination */}
        <section className="space-y-2">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            2. Probabilistic Root Cause Attribution
          </h3>
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-purple-300 font-bold">PRIMARY DIAGNOSIS:</span>
              <span className="text-purple-300 font-extrabold text-sm">
                {Math.round(report.confidence * 100)}% Confidence ({report.confidence_tier})
              </span>
            </div>
            <p className="text-sm font-bold text-slate-100 font-mono">
              {report.root_cause}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 font-sans">
              {report.reasoning}
            </p>
          </div>
        </section>

        {/* 3. Supporting & Contradicting Evidence */}
        <section className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            3. Formal Evidence Trail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-[11px] uppercase">
                Supporting Telemetry Proof ({report.supporting_evidence.length}):
              </span>
              <ul className="space-y-1.5">
                {report.supporting_evidence.map((ev, i) => (
                  <li key={i} className="text-slate-300 text-[11px] leading-relaxed">
                    • <strong>[{ev.evidence_type}]</strong>: {ev.description}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-rose-400 font-bold block text-[11px] uppercase">
                Contradicting Checks ({report.contradicting_evidence.length}):
              </span>
              <ul className="space-y-1.5">
                {report.contradicting_evidence.map((ev, i) => (
                  <li key={i} className="text-slate-400 text-[11px] leading-relaxed">
                    • <strong>[{ev.evidence_type}]</strong>: {ev.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Alternative Hypotheses Evaluation */}
        <section className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            4. Alternative Hypotheses & Counterfactual Analysis
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {report.hypotheses.map((h, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200">{h.title}</span>
                  <span className="text-slate-400 text-[11px] block">{h.reasoning || h.description}</span>
                </div>
                <span className="font-bold text-purple-300">
                  {Math.round(h.confidence * 100)}% ({h.status})
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Propagation Path Sequence */}
        <section className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            5. Network Propagation Path
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {report.propagation_path.map((step) => (
              <div
                key={step.step_number}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                    {step.step_number}
                  </span>
                  <span className="font-bold text-cyan-400">{step.component}</span>
                  <span className="text-slate-300 font-sans text-[11px]">{step.description}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{step.timestamp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Actionable Recommendations */}
        <section className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            6. Engineer Remediation Plan & Post-Incident Actions
          </h3>
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs font-mono">
            {report.recommended_actions.map((act, i) => (
              <div key={i} className="text-slate-200 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="font-sans leading-relaxed">{act}</span>
              </div>
            ))}
            <div className="pt-2 text-[10px] text-amber-400 font-mono">
              * AI-generated recommendations require engineer validation prior to execution in live production.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
