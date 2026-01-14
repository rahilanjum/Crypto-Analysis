import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResponse, Ticker } from '../types';
import { ExternalLink, Sparkles, Mail, Send, Twitter } from 'lucide-react';

interface AnalysisDisplayProps {
  response: AnalysisResponse | null;
  ticker: Ticker;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ response, ticker }) => {
  const [includeLinks, setIncludeLinks] = useState(true);

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
        } else {
            bodyContent += "No specific search sources cited.\n";
        }

        bodyContent += "\n**Quick Whale Reference:**\n";
        bodyContent += "- [Trader 0x94...3814](https://legacy.hyperdash.com/trader/0x94d3735543ecb3d339064151118644501c933814)\n";
        bodyContent += "- [Trader 0x15...c9dc](https://legacy.hyperdash.com/trader/0x152e41f0b83e6cad4b5dc730c1d6279b7d67c9dc)\n";
        bodyContent += "- [Trader 0x0d...a902](https://legacy.hyperdash.com/trader/0x0ddf9bae2af4b874b96d287a5ad42eb47138a902)\n";
    }

    const body = encodeURIComponent(bodyContent);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleShareOnX = () => {
    // Attempt to extract the "X Post Draft" section from the markdown
    // We look for "### 6. X Post Draft" and grab everything after it until end of string or next potential header
    const draftMatch = response.markdown.match(/### 6\. X Post Draft\s*([\s\S]*?)$/i);
    let textToShare = "";

    if (draftMatch && draftMatch[1]) {
        // Clean up any markdown bolding/italics for the raw text tweet
        textToShare = draftMatch[1].replace(/\*\*/g, '').replace(/\*/g, '').trim();
    } else {
        // Fallback
        textToShare = `$${ticker} Technical Analysis. 2H Timeframe check. #Crypto`;
    }

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-750 overflow-hidden shadow-2xl mt-8 animate-fade-in">
      <div className="bg-gray-900/50 p-4 border-b border-gray-750 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-400 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          AI Technical Analysis
        </h2>
        
        <div className="flex items-center gap-3">
             <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-gray-300 select-none hidden md:flex">
                <input
                    type="checkbox"
                    checked={includeLinks}
                    onChange={(e) => setIncludeLinks(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-800 text-brand-500 focus:ring-brand-500/50 focus:ring-offset-0 w-3.5 h-3.5"
                />
                Links in Email
            </label>
            
            <button
              onClick={handleShareOnX}
              className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all border border-gray-700 shadow-lg"
              title="Post Summary to X"
            >
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Share on X</span>
            </button>

            <button
              onClick={handleEmailReport}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-brand-500/20"
              title="Send report to rahil82@gmail.com"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </button>
        </div>
      </div>
      
      <div className="p-6 md:p-8 prose prose-invert prose-blue max-w-none">
        <ReactMarkdown
          components={{
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-gray-700 pb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-brand-400 mt-6 mb-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-gray-300" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
            strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
            a: ({node, ...props}) => <a className="text-brand-400 hover:text-brand-300 underline font-medium" target="_blank" rel="noreferrer" {...props} />,
          }}
        >
          {response.markdown}
        </ReactMarkdown>
      </div>

      {response.groundingSources && response.groundingSources.length > 0 && (
        <div className="bg-gray-900 p-4 border-t border-gray-750">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Search Sources</h4>
            <span className="text-[10px] text-gray-600 font-mono">Real-time Grounding Active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {response.groundingSources.map((source, index) => (
              <a 
                key={index} 
                href={source.uri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center text-xs bg-gray-800 hover:bg-gray-700 text-brand-400 px-3 py-1.5 rounded-full transition-colors border border-gray-700"
              >
                {source.title}
                <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Whale Links */}
      <div className="bg-brand-900/10 p-4 border-t border-gray-750">
        <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase flex items-center">
            <Send className="w-3 h-3 mr-2" /> Quick Whale Reference
        </h4>
        <div className="flex flex-col gap-2">
            <a href="https://legacy.hyperdash.com/trader/0x94d3735543ecb3d339064151118644501c933814" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                Trader 0x94...3814
                <ExternalLink className="w-2.5 h-2.5 ml-1" />
            </a>
            <a href="https://legacy.hyperdash.com/trader/0x152e41f0b83e6cad4b5dc730c1d6279b7d67c9dc" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                Trader 0x15...c9dc
                <ExternalLink className="w-2.5 h-2.5 ml-1" />
            </a>
            <a href="https://legacy.hyperdash.com/trader/0x0ddf9bae2af4b874b96d287a5ad42eb47138a902" target="_blank" rel="noreferrer" className="text-xs text-brand-400 hover:underline flex items-center">
                Trader 0x0d...a902
                <ExternalLink className="w-2.5 h-2.5 ml-1" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;