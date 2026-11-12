import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Code,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sliders,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { AgentMessage, WorkflowStep, AgentRecommendation, Product } from '../../types';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const AgentWorkspace: React.FC<{
  onInspectProduct: (prod: Product) => void;
}> = ({ onInspectProduct }) => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen, setIsCheckoutOpen, selectedCurrency } = useCart();

  const [prompt, setPrompt] = useState('');
  const [budgetLimit, setBudgetLimit] = useState(user?.monthlyBudget || 200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your AgentPay AI Commerce Architect. Describe your software development goals and budget, and I'll analyze requirements, search our verified catalog, compare tools, optimize your budget, and prepare a purchase plan with PayPal checkout.",
      timestamp: new Date().toISOString()
    }
  ]);

  const [activeWorkflowSteps, setActiveWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<AgentRecommendation | null>(null);
  const [showToolsLog, setShowToolsLog] = useState(true);

  const samplePrompts = [
    {
      label: '🚀 Launch AI SaaS ($200)',
      text: 'I have a budget of $200 and need developer tools to build and launch an AI SaaS application. Recommend a complete stack.',
      budget: 200
    },
    {
      label: '⚡ DevOps & CI/CD ($100)',
      text: 'Recommend cloud hosting, automated CI/CD pipelines, and observability tools under $100.',
      budget: 100
    },
    {
      label: '🛡️ Enterprise Security ($50)',
      text: 'I need robust user authentication, passkeys, RBAC, and DNS protection with a strict budget of $50.',
      budget: 50
    }
  ];

  const handleSend = async (userPromptText?: string, userBudgetValue?: number) => {
    const textToSend = userPromptText || prompt;
    const currentBudget = userBudgetValue !== undefined ? userBudgetValue : budgetLimit;

    if (!textToSend.trim()) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const res = await api.sendAgentChat(textToSend, currentBudget);
      setActiveWorkflowSteps(res.workflowSteps);
      setCurrentRecommendation(res.recommendation);
      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      setError(err.message || 'AI Agent request failed.');
      const errorMsg: AgentMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: 'Agent encountered an error searching catalog. Please try again or adjust your budget criteria.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCartAndCheckout = async () => {
    if (!currentRecommendation) return;

    for (const item of currentRecommendation.recommendedProducts) {
      await addToCart(item.product.id, item.selectedQuantity || 1);
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-violet-500/20 text-violet-400">
              <Bot className="w-5 h-5 text-cyan-400" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Agent Commerce Workspace</h1>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous requirement extraction, verified catalog discovery, budget optimization, and PayPal checkout.
          </p>
        </div>

        {/* Budget Ceiling Controller */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <Sliders className="w-4 h-4 text-violet-400" />
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] block">Target Budget Limit</span>
            <div className="flex items-center gap-1 font-mono font-bold text-white">
              <span>$</span>
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="w-16 bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                min={10}
                max={2000}
              />
              <span className="text-slate-400 text-[10px]">USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Chat Conversation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Prompts Bar */}
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setBudgetLimit(sp.budget);
                  handleSend(sp.text, sp.budget);
                }}
                disabled={loading}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all text-left flex items-center gap-1.5"
              >
                <span>{sp.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4 flex flex-col shadow-inner">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                        : isSystem
                        ? 'bg-rose-900/50 text-rose-300 border border-rose-700'
                        : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md'
                    }`}
                  >
                    {isUser ? 'You' : <Bot className="w-4 h-4 text-cyan-300" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600/30 to-cyan-600/30 border border-cyan-500/30 text-white rounded-tr-none'
                        : isSystem
                        ? 'bg-rose-950/30 border border-rose-800 text-rose-300 rounded-tl-none'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Tool Calls Accordion in Message */}
                    {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          Executed Agent Tools:
                        </span>
                        {msg.toolInvocations.map((tool, tIdx) => (
                          <div key={tIdx} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2">
                            <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-cyan-300 font-bold">{tool.toolName}</span>
                              <p className="text-slate-400 text-[10px]">{tool.resultSummary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-pulse text-cyan-300" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Agent orchestrating tools: querying verified catalog and optimizing budget...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 focus-within:border-cyan-500/80 transition-colors shadow-lg"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Recommend tools for an online business with a budget of $150..."
              disabled={loading}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              aria-label="Send prompt to AI agent"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Ask Agent</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Live Agentic Workflow & Recommendation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Workflow Stepper Engine */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Agentic Workflow Engine
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                {activeWorkflowSteps.length > 0 ? 'Workflow Active' : 'Idle'}
              </span>
            </div>

            {activeWorkflowSteps.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Submit a goal on the left to see the step-by-step agentic execution plan.
              </p>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {activeWorkflowSteps.map((step) => {
                  const isDone = step.status === 'completed';
                  const isApproval = step.status === 'waiting_approval';

                  return (
                    <div key={step.id} className="relative flex items-start gap-3 pl-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isApproval
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </div>

                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isDone ? 'text-slate-200' : 'text-amber-300'}`}>
                            {step.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prepared Recommendation & Explicit Approval Trigger */}
          {currentRecommendation && (
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Recommended Purchase Plan
                  </span>
                  <h3 className="text-sm font-bold text-white">Optimized Product Bundle</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white block">
                    {formatCurrency(convertCurrency(currentRecommendation.totalCost, selectedCurrency), selectedCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    (${currentRecommendation.totalCost.toFixed(2)} USD via PayPal)
                  </span>
                  <span className={`text-[10px] font-mono ${currentRecommendation.withinBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentRecommendation.withinBudget
                      ? `${formatCurrency(convertCurrency(currentRecommendation.remainingBudget, selectedCurrency), selectedCurrency)} under budget`
                      : 'Exceeds budget'}
                  </span>
                </div>
              </div>

              {/* Recommended Items */}
              <div className="space-y-2.5">
                {currentRecommendation.recommendedProducts.map((rec) => (
                  <div
                    key={rec.product.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={rec.product.image}
                        alt={rec.product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-semibold text-white truncate">{rec.product.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono">
                            {rec.fitScore}% match
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{rec.reason}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-white block">
                        {formatCurrency(convertCurrency(rec.product.price, selectedCurrency), selectedCurrency)}
                      </span>
                      <button
                        onClick={() => onInspectProduct(rec.product)}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Inspect specs
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security checkpoint alert */}
              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-[11px] text-slate-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Approval Required:</strong> Agent cannot automatically purchase without your explicit consent.
                </span>
              </div>

              {/* Direct Approve & Checkout Button */}
              <button
                onClick={handleAddAllToCartAndCheckout}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
              >
                <span>Review & Approve Purchase on PayPal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
