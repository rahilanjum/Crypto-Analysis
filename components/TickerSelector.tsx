import React from 'react';
import { PresetTicker } from '../types';
import { Activity, Search } from 'lucide-react';

interface TickerSelectorProps {
  selectedTicker: string;
  onSelect: (ticker: string) => void;
}

const TickerSelector: React.FC<TickerSelectorProps> = ({ selectedTicker, onSelect }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center text-brand-400">
        <Activity className="w-5 h-5 mr-2" />
        Select Asset
      </h2>
      
      {/* Presets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {Object.values(PresetTicker).map((ticker) => (
          <button
            key={ticker}
            onClick={() => onSelect(ticker)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200 truncate
              ${
                selectedTicker === ticker
                  ? 'bg-brand-600/20 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                  : 'bg-gray-850 border-gray-750 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              }
            `}
            title={ticker}
          >
            {ticker}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
        </div>
        <input
          type="text"
          value={selectedTicker}
          onChange={(e) => onSelect(e.target.value.toUpperCase())}
          placeholder="Or enter custom ticker (e.g. SOLUSD, DOGE)"
          className="block w-full pl-10 pr-3 py-3 border border-gray-750 rounded-lg leading-5 bg-gray-950 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm transition-all"
        />
      </div>
    </div>
  );
};

export default TickerSelector;