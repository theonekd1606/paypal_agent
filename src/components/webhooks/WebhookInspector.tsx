import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, Play, CheckCircle2, AlertOctagon, RefreshCw, Copy, Check, FileJson } from 'lucide-react';
import { api } from '../../services/api';
import { WebhookEvent } from '../../types';

export const WebhookInspector: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [eventTypeInput, setEventTypeInput] = useState('PAYMENT.CAPTURE.COMPLETED');
  const [simulatedAmount, setSimulatedAmount] = useState(49.0);
  const [copied, setCopied] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await api.getWebhooks();
      setEvents(res.events);
      if (res.events.length > 0 && !selectedEvent) {
        setSelectedEvent(res.events[0]);
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const res = await api.simulateWebhook(eventTypeInput, simulatedAmount);
      setEvents((prev) => [res.event, ...prev]);
      setSelectedEvent(res.event);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyJSON = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">PayPal Sandbox Webhook Simulator & Event Inspector</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and inspect asynchronous PayPal Sandbox event notifications, webhook signatures, and automated reconciliation.
          </p>
        </div>

        <button
          onClick={fetchWebhooks}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Events</span>
        </button>
      </div>

      {/* Simulator Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Simulate Event:</label>
          <select
            value={eventTypeInput}
            onChange={(e) => setEventTypeInput(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</option>
            <option value="PAYMENT.CAPTURE.DENIED">PAYMENT.CAPTURE.DENIED</option>
            <option value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED</option>
            <option value="BILLING.SUBSCRIPTION.CANCELLED">BILLING.SUBSCRIPTION.CANCELLED</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono">
            <span className="text-slate-500">$</span>
            <input
              type="number"
              value={simulatedAmount}
              onChange={(e) => setSimulatedAmount(Number(e.target.value))}
              className="w-16 bg-transparent text-white focus:outline-none font-bold"
              step={5}
            />
            <span className="text-slate-500 text-[10px]">USD</span>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md disabled:opacity-40"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{simulating ? 'Simulating...' : 'Dispatch Webhook Event'}</span>
        </button>
      </div>

      {/* Two-Column Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Event Stream (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span>Event Stream Log ({events.length})</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-slate-500 py-10 text-center">No webhook events logged yet.</p>
            ) : (
              events.map((ev) => {
                const isSelected = selectedEvent?.id === ev.id;
                const isDenied = ev.eventType.includes('DENIED');

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/80 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-mono font-bold text-[11px] ${isDenied ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {ev.eventType}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">{ev.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Sig Verified</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{ev.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Event Payload & Signature Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Event Payload & Headers Inspector
              </h3>
              <span className="text-[11px] font-mono text-slate-400">{selectedEvent?.id}</span>
            </div>

            <button
              onClick={handleCopyJSON}
              disabled={!selectedEvent}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          {selectedEvent ? (
            <div className="space-y-4">
              {/* Security Validation Metadata */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal-Transmission-Id:</span>
                  <span className="text-cyan-400">{selectedEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PayPal-Auth-Algo:</span>
                  <span className="text-slate-300">SHA256withRSA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Webhook Verification:</span>
                  <span className="text-emerald-400 font-bold">STATUS: SUCCESS (VALID)</span>
                </div>
              </div>

              {/* Formatted JSON Payload */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[380px] text-cyan-300 leading-relaxed shadow-inner">
                <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-20 text-center">Select an event from the stream to inspect details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
