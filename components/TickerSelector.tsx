import React from 'react';
import { Ticker } from '../types';
import { Activity } from 'lucide-react';

interface TickerSelectorProps {
  selectedTicker: Ticker;
  onSelect: (ticker: Ticker) => void;
}

const TickerSelector: React.FC<TickerSelectorProps> = ({ selectedTicker, onSelect }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center text-brand-400">
        <Activity className="w-5 h-5 mr-2" />
        Select Asset
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.values(Ticker).map((ticker) => (
          <button
            key={ticker}
            onClick={() => onSelect(ticker)}
            className={`
              p-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${
                selectedTicker === ticker
                  ? 'bg-brand-600/20 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                  : 'bg-gray-850 border-gray-750 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              }
            `}
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TickerSelector;
