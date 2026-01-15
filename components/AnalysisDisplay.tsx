import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResponse, Ticker } from '../types';
import { ExternalLink, Sparkles, Mail, Twitter, Copy, CheckCircle2, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface AnalysisDisplayProps {
  response: AnalysisResponse | null;
  ticker: Ticker;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ response, ticker }) => {
  const [includeLinks, setIncludeLinks] = useState(true);
  const [copied, setCopied] = useState(false);

  // Extract Social Summary and Confidence Score
  const { socialSummary, confidenceScore, convictionReason, cleanMarkdown } = useMemo(() => {
    if (!response?.markdown) return { socialSummary: '', confidenceScore: 0, convictionReason: '', cleanMarkdown: '' };

    let text = response.markdown;
    
    // Extract Social Summary
    const socialMatch = text.match(/### Social Media Summary\s*([\s\S]*?)$/i);
    const socialSummary = socialMatch ? socialMatch[1].trim() : '';
    
    // Remove Social Summary from main display text to show it in special block
    if (socialMatch) {
      text = text.replace(socialMatch[0], '');
    }

    // Extract Confidence Score
    // format: **AI Conviction Score:** 7.5/10 (Rationale)
    const scoreMatch = text.match(/\*\*AI Conviction Score:\*\*\s*([\d.]+)\/10\s*(\(([^)]+)\))?/i);
    const confidenceScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const convictionReason = scoreMatch && scoreMatch[3] ? scoreMatch[3] : '';

    // Remove the raw score line from text so we can render custom UI
    if (scoreMatch) {
        text = text.replace(scoreMatch[0], '');
    }

    return { socialSummary, confidenceScore, convictionReason, cleanMarkdown: text };
  }, [response]);

  if (!response) return null;

  const handleEmailReport = () => {
    const email = 'rahil82@gmail.com';
    const date = new Date().toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const subject = encodeURIComponent(`Technical Analysis Report: ${ticker} - ${date}`);
    
    let bodyContent = response.markdown;

    if (includeLinks) {
        bodyContent += "\n\n---\n\n**Search Sources:**\n";
        if (response.groundingSources && response.groundingSources.length > 0) {
             response.groundingSources.forEach(s => {
                bodyContent += `- ${s.title}: ${s.uri}\n`;
            });
        }
    }

    const body = encodeURIComponent(bodyContent);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCopySocial = () => {
    navigator.clipboard.writeText(socialSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareOnX = () => {
    const textToShare = socialSummary || `$${ticker} Technical Analysis #Crypto`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 border-green-500/50 bg-green-500/10';
    if (score >= 5) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-red-400 border-red-500/50 bg-red-500/10';
  };

  return (
    <div className="space-y-6 mt-8 animate-fade-in">
      
      {/* 1. Header Card with Confidence Score */}
      <div className="bg-gray-850 rounded-xl border border-gray-750 overflow-hidden shadow-2xl">
          <div className="bg-gray-900/50 p-4 border-b border-gray-750 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-brand-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Technical Analysis
            </h2>
            
            {confidenceScore > 0 && (
                <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${getScoreColor(confidenceScore)}`}>
                    <Activity className="w-4 h-4" />
                    <span className="font-bold">Conviction: {confidenceScore}/10</span>
                    {convictionReason && <span className="hidden sm:inline text-xs opacity-80">| {convictionReason}</span>}
                </div>
            )}
          </div>
          
          {/* Main Markdown Content with Custom Table Styling */}
          <div className="p-6 md:p-8">
            <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown
                components={{
                    // Quick Reference Table Styling
                    table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-6 rounded-lg border border-gray-700 bg-gray-900/50">
                            <table className="w-full text-left border-collapse" {...props} />
                        </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-gray-800" {...props} />,
                    th: ({node, ...props}) => <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700 whitespace-nowrap" {...props} />,
                    td: ({node, ...props}) => <td className="p-3 text-sm text-gray-200 border-b border-gray-800/50 whitespace-nowrap" {...props} />,
                    
                    // Standard Typography
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-brand-400 mt-6 mb-3 uppercase tracking-wide" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-gray-300" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                    a: ({node, ...props}) => <a className="text-brand-400 hover:text-brand-300 underline font-medium" target="_blank" rel="noreferrer" {...props} />,
                }}
                >
                {cleanMarkdown}
                </ReactMarkdown>
            </div>
          </div>
      </div>

      {/* 2. Social Media Block */}
      {socialSummary && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-850 rounded-xl border border-gray-700 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center">
                    <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                    Social Summary (Copy & Post)
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopySocial}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                    >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={handleShareOnX}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open X
                    </button>
                </div>
            </div>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800/50">
                {socialSummary}
            </div>
        </div>
      )}

      {/* 3. Footer Links / Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {response.groundingSources && response.groundingSources.length > 0 && (
            <div className="bg-gray-850 p-4 rounded-xl border border-gray-750">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase">Search Sources</h4>
            </div>
            <div className="flex flex-col gap-2">
                {response.groundingSources.slice(0, 3).map((source, index) => (
                <a 
                    key={index} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center text-xs text-gray-400 hover:text-brand-400 transition-colors truncate"
                >
                    <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{source.title}</span>
                </a>
                ))}
            </div>
            </div>
        )}

        <div className="bg-gray-850 p-4 rounded-xl border border-gray-750">
            <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase flex items-center">
                <TrendingUp className="w-3 h-3 mr-2" /> Quick Whale Reference
            </h4>
            <div className="flex flex-col gap-2">
                <a href="https://legacy.hyperdash.com/trader/0x94d3735543ecb3d339064151118644501c933814" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                    Trader 0x94...3814 (Smart Money)
                </a>
                <a href="https://legacy.hyperdash.com/trader/0x152e41f0b83e6cad4b5dc730c1d6279b7d67c9dc" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                    Trader 0x15...c9dc (Whale)
                </a>
                 <a href="https://legacy.hyperdash.com/trader/0x0ddf9bae2af4b874b96d287a5ad42eb47138a902" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                    Trader 0x0d...a902 (Aggressive)
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;