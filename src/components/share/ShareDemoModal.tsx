import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, Share2, ExternalLink, Globe, Sparkles, Video, Play, 
  Download, Film, Youtube, CheckCircle2, Clock, Tag, FileText, ArrowUpRight 
} from 'lucide-react';

interface ShareDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
}

interface VideoOption {
  id: string;
  title: string;
  author: string;
  youtubeId: string;
  description: string;
  isOfficial?: boolean;
}

const PRESET_YOUTUBE_VIDEOS: VideoOption[] = [
  {
    id: 'paypal-enabling',
    title: 'Enabling Agentic Payments With PayPal',
    author: 'PayPal Developer',
    youtubeId: 'OeCWilI18Ec',
    description: 'Official technical demonstration showing how PayPal infrastructure enables AI agents to facilitate secure checkouts and manage multi-step purchasing workflows.',
    isOfficial: true,
  },
  {
    id: 'paypal-apis',
    title: "PayPal's Agentic Ready APIs and Services",
    author: 'PayPal Developer',
    youtubeId: '_D5deKBQV5k',
    description: 'PayPal engineers demonstrate integrating agentic commerce experiences using PayPal agent toolkits, remote MCP servers, and APIs.',
    isOfficial: true,
  },
];

export const ShareDemoModal: React.FC<ShareDemoModalProps> = ({ isOpen, onClose, currentTab }) => {
  const [activeModalTab, setActiveModalTab] = useState<'youtube' | 'localVideo' | 'appUrl'>('youtube');
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedVideoUrl, setCopiedVideoUrl] = useState(false);
  const [copiedYoutubeUrl, setCopiedYoutubeUrl] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  
  const [selectedYoutubeId, setSelectedYoutubeId] = useState<string>('OeCWilI18Ec');
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [showUploadGuide, setShowUploadGuide] = useState<boolean>(false);
  const [includeTab, setIncludeTab] = useState(false);
  const [selectedDemoTab, setSelectedDemoTab] = useState(currentTab || 'workspace');

  const BASE_SHARED_URL = 'https://ais-pre-wa5npuj7mk7n7onuysqyh3-545289355863.asia-southeast1.run.app';
  const effectiveAppUrl = includeTab ? `${BASE_SHARED_URL}#${selectedDemoTab}` : BASE_SHARED_URL;
  const VIDEO_WALKTHROUGH_URL = `${BASE_SHARED_URL}/demo-walkthrough.webm`;
  const currentYoutubeUrl = `https://www.youtube.com/watch?v=${selectedYoutubeId}`;

  // Load custom YouTube ID from localStorage if present
  useEffect(() => {
    const savedCustomId = localStorage.getItem('agentpay_custom_youtube_id');
    if (savedCustomId) {
      setSelectedYoutubeId(savedCustomId);
      setCustomInputUrl(`https://www.youtube.com/watch?v=${savedCustomId}`);
    }
  }, []);

  if (!isOpen) return null;

  // Helper to extract YouTube video ID from various URL formats or raw ID
  const extractYouTubeId = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleApplyCustomYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractYouTubeId(customInputUrl);
    if (extracted) {
      setSelectedYoutubeId(extracted);
      localStorage.setItem('agentpay_custom_youtube_id', extracted);
    }
  };

  const copyToClipboard = async (text: string, setCopiedFn: (val: boolean) => void) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.warn('execCommand copy fallback failed', e);
      }
      document.body.removeChild(textarea);
    }
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2200);
  };

  const YOUTUBE_KIT_TITLE = "AgentPay AI: Autonomous Agentic Commerce & PayPal Payments Walkthrough";
  const YOUTUBE_KIT_DESC = `🚀 AgentPay AI - Autonomous Agentic Commerce & PayPal Payments Platform Demonstration

Watch the complete end-to-end walkthrough of autonomous procurement, knapsack budget optimization, human approval gating, and server-side PayPal Sandbox capture.

⏱️ Chapters & Timestamps:
0:00 - Introduction & Agentic Commerce Workflow
0:30 - Natural Language Goal Parsing & $200 Budget Setting
1:00 - Catalog Matching & Knapsack Bundle Recommendation
1:30 - Mandatory Human-in-the-Loop Authorization Gate
2:00 - PayPal Sandbox Server-Side Order Creation & Capture
2:30 - Digital Receipt Confirmation & Instant JSON Export
3:00 - Real-Time Spend Analytics & SaaS Subscription Management

🌐 Live App Demo: ${BASE_SHARED_URL}
🛠️ Built With: React 19, TypeScript, Express, Tailwind CSS, PayPal Orders API v2
#AgenticCommerce #AI #PayPal #FinTech #AutonomousAgents #Demo`;

  const YOUTUBE_KIT_TAGS = "Agentic AI, PayPal Sandbox, Autonomous Commerce, AI Agents, Budget Optimization, FinTech, React 19, Express, PayPal API";

  const shareText = encodeURIComponent(
    'Watch the AgentPay AI Demo on YouTube — an Agentic Commerce Platform with autonomous discovery, budget optimization, human authorization checkpoints, and PayPal Sandbox checkout!'
  );
  const encodedAppUrl = encodeURIComponent(effectiveAppUrl);

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedAppUrl}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedAppUrl}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodedAppUrl}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-violet-600 to-cyan-500 p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Youtube className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Demonstration & Video Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  YouTube & Web
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Shareable YouTube videos, local HD recording, and live web app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveModalTab('youtube')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium border-b-2 transition-all cursor-pointer ${
              activeModalTab === 'youtube'
                ? 'border-rose-500 text-white bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>YouTube Demonstration</span>
          </button>

          <button
            onClick={() => setActiveModalTab('localVideo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium border-b-2 transition-all cursor-pointer ${
              activeModalTab === 'localVideo'
                ? 'border-cyan-500 text-white bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <span>App Recording (.webm)</span>
          </button>

          <button
            onClick={() => setActiveModalTab('appUrl')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-medium border-b-2 transition-all cursor-pointer ${
              activeModalTab === 'appUrl'
                ? 'border-violet-500 text-white bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Globe className="w-4 h-4 text-violet-400" />
            <span>Live App URL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs max-h-[72vh] overflow-y-auto">
          {/* TAB 1: YouTube Hub */}
          {activeModalTab === 'youtube' && (
            <div className="space-y-4">
              {/* Active YouTube Video Player */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-xl">
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${selectedYoutubeId}?rel=0`}
                    title="YouTube video demonstration"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* YouTube Video Selection Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Select Demonstration Video:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_YOUTUBE_VIDEOS.map((vid) => (
                    <button
                      key={vid.id}
                      onClick={() => setSelectedYoutubeId(vid.youtubeId)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedYoutubeId === vid.youtubeId
                          ? 'border-rose-500/70 bg-rose-950/20 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-xs text-white line-clamp-1">{vid.title}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                            Official
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{vid.description}</p>
                      </div>
                      <span className="text-[10px] text-rose-400 mt-2 font-mono flex items-center gap-1">
                        <Youtube className="w-3 h-3" />
                        <span>youtube.com/watch?v={vid.youtubeId}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Active YouTube Link */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-200 truncate select-all">
                    {currentYoutubeUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(currentYoutubeUrl, setCopiedYoutubeUrl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                      copiedYoutubeUrl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {copiedYoutubeUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedYoutubeUrl ? 'Copied YouTube Link!' : 'Copy YouTube Link'}</span>
                  </button>

                  <a
                    href={currentYoutubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-755 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Custom YouTube URL Input */}
              <form onSubmit={handleApplyCustomYoutube} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Link Your Own YouTube Upload:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste your YouTube URL (e.g. https://youtu.be/xxx or https://youtube.com/watch?v=xxx)"
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Load Video
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Uploaded the app demo to your YouTube channel? Paste it here to display it directly inside the app for all visitors.
                </p>
              </form>

              {/* YouTube Upload Helper Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setShowUploadGuide(!showUploadGuide)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-violet-950/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>Upload Your Custom Demo Walkthrough to YouTube (30-Sec Kit)</span>
                  </div>
                  <span className="text-[11px]">{showUploadGuide ? 'Hide Kit ▲' : 'Open Kit ▼'}</span>
                </button>

                {showUploadGuide && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">YouTube Video Publishing Package</span>
                      <a
                        href="https://studio.youtube.com/channel/UC/videos/upload"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Open YouTube Studio</span>
                      </a>
                    </div>

                    <div className="space-y-3">
                      {/* Step 1: Video File */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div>
                          <div className="font-semibold text-white">1. Download Demo Video File</div>
                          <div className="text-[10px] text-slate-400">1280x720 HD Chromium Walkthrough (835 KB .webm)</div>
                        </div>
                        <a
                          href="/demo-walkthrough.webm"
                          download="AgentPay-AI-Demo-Walkthrough.webm"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1.5 font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Download</span>
                        </a>
                      </div>

                      {/* Step 2: Title */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">2. Video Title</span>
                          <button
                            onClick={() => copyToClipboard(YOUTUBE_KIT_TITLE, setCopiedTitle)}
                            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedTitle ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTitle ? 'Copied Title!' : 'Copy Title'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 select-all">
                          {YOUTUBE_KIT_TITLE}
                        </div>
                      </div>

                      {/* Step 3: Description & Timestamps */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">3. Description with Chapters & Timestamps</span>
                          <button
                            onClick={() => copyToClipboard(YOUTUBE_KIT_DESC, setCopiedDesc)}
                            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedDesc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDesc ? 'Copied Description!' : 'Copy Description'}</span>
                          </button>
                        </div>
                        <pre className="font-mono text-[10px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {YOUTUBE_KIT_DESC}
                        </pre>
                      </div>

                      {/* Step 4: Tags */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">4. YouTube Tags</span>
                          <button
                            onClick={() => copyToClipboard(YOUTUBE_KIT_TAGS, setCopiedTags)}
                            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedTags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedTags ? 'Copied Tags!' : 'Copy Tags'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-[10px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 select-all">
                          {YOUTUBE_KIT_TAGS}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Direct Local App Recording */}
          {activeModalTab === 'localVideo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      High-Definition Video Recording (WEBM)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Host Stream Ready
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Recorded walkthrough of this specific application showing AI requirement discovery, knapsack budget allocation ($200 budget), user authorization gate, PayPal Sandbox capture, and live analytics sync.
                </p>

                {/* Direct Video Player */}
                <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
                  <video
                    controls
                    autoPlay
                    className="w-full max-h-64 object-contain bg-black"
                    src="/demo-walkthrough.webm"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-2 text-center text-[10px] text-slate-400 font-mono bg-slate-950">
                    Resolution: 1280x720 • Size: 835 KB • Codec: VP8 / WebM
                  </div>
                </div>

                {/* Video Action Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(VIDEO_WALKTHROUGH_URL, setCopiedVideoUrl)}
                    className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    {copiedVideoUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVideoUrl ? 'Copied Video Link!' : 'Copy Direct Video URL'}</span>
                  </button>

                  <a
                    href="/demo-walkthrough.webm"
                    download="AgentPay-AI-Demo-Walkthrough.webm"
                    className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File (.webm)</span>
                  </a>

                  <a
                    href={VIDEO_WALKTHROUGH_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Full Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Application URL */}
          {activeModalTab === 'appUrl' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Public Demonstration URL:
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-cyan-500 transition-colors">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    readOnly
                    value={effectiveAppUrl}
                    className="flex-1 bg-transparent text-white font-mono text-[11px] select-all focus:outline-none truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(effectiveAppUrl, setCopiedAppUrl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                      copiedAppUrl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white'
                    }`}
                  >
                    {copiedAppUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAppUrl ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Deep link selector */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Link Directly to Current View</span>
                  <input
                    type="checkbox"
                    id="tab-deeplink-toggle"
                    checked={includeTab}
                    onChange={(e) => setIncludeTab(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </div>

                {includeTab && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {[
                      { id: 'workspace', label: 'AI Agent' },
                      { id: 'catalog', label: 'Catalog' },
                      { id: 'compare', label: 'Comparison' },
                      { id: 'subscriptions', label: 'Subscriptions' },
                      { id: 'orders', label: 'Orders' },
                      { id: 'transactions', label: 'Transactions' },
                      { id: 'webhooks', label: 'Webhooks' },
                      { id: 'analytics', label: 'Dashboard' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedDemoTab(t.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                          selectedDemoTab === t.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        #{t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Share to Social Networks
                </span>
                <div className="grid grid-cols-3 gap-2 font-medium">
                  <a
                    href={linkedinShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#70B5F9] border border-[#0A66C2]/30 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <span>X / Twitter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#4ADE80] border border-[#25D366]/30 flex items-center justify-center gap-2 transition-colors text-center"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-3">
          <a
            href={effectiveAppUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Open live app in new tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
