import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResponse } from '../types';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AnalysisDisplayProps {
  response: AnalysisResponse | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ response }) => {
  if (!response) return null;

  return (
    <div className="bg-gray-850 rounded-xl border border-gray-750 overflow-hidden shadow-2xl mt-8 animate-fade-in">
      <div className="bg-gray-900/50 p-4 border-b border-gray-750 flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-400 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          AI Technical Analysis
        </h2>
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
          }}
        >
          {response.markdown}
        </ReactMarkdown>
      </div>

      {response.groundingSources && response.groundingSources.length > 0 && (
        <div className="bg-gray-900 p-4 border-t border-gray-750">
          <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">Sources & References</h4>
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
    </div>
  );
};

export default AnalysisDisplay;
