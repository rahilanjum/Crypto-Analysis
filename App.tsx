import React, { useState } from 'react';
import { PresetTicker, TechnicalData, AnalysisResponse } from './types';
import TickerSelector from './components/TickerSelector';
import TechnicalForm from './components/TechnicalForm';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeTechnicalData } from './services/geminiService';
import { BrainCircuit } from 'lucide-react';

const initialData: TechnicalData = {
  currentPrice: '',
  supportResistance: { '2h': '', '4h': '', '1D': '', '1W': '' },
  weeklySweep: { sweep1: '', sweep2: '' },
  fvgFibs: { '2h': '', '4h': '', '1D': '', '1W': '' },
  candleFibs: { '2h': '', '4h': '', '1D': '', '1W': '' },
  timeFibs: { t0: '', t0_618: '', t0_786: '', t1_618: '' },
  timeFibsTimeframe: '2h',
};

const App: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>(PresetTicker.BTCUSD);
  const [techData, setTechData] = useState<TechnicalData>(initialData);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to check for user data
  const hasUserChanges = (data: TechnicalData): boolean => {
      const hasSR = Object.values(data.supportResistance).some(v => v !== '');
      const hasSweep = data.weeklySweep.sweep1 !== '' || data.weeklySweep.sweep2 !== '';
      const hasFvg = Object.values(data.fvgFibs).some(v => v !== '');
      const hasCandle = Object.values(data.candleFibs).some(v => v !== '');
      const hasPrice = data.currentPrice !== '';
      
      return hasSR || hasSweep || hasFvg || hasCandle || hasPrice;
  };

  const handleTickerChange = (ticker: string) => {
    if (ticker === selectedTicker) return;

    if (hasUserChanges(techData)) {
        if (!window.confirm("You have unsaved changes. Switching tickers will discard your current input (excluding Time Fibs). Continue?")) {
            return;
        }
    }

    setSelectedTicker(ticker);
    setAnalysis(null);
    
    // Preserve Time Fibs and Timeframe when switching tickers
    setTechData(prev => ({
      ...initialData,
      timeFibs: prev.timeFibs,
      timeFibsTimeframe: prev.timeFibsTimeframe
    }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeTechnicalData(selectedTicker, techData);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to generate analysis. Please check your network and API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-brand-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2 rounded-lg">
                    <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Crypto<span className="text-brand-400">Analyst</span></h1>
                    <p className="text-xs text-gray-500 font-mono">Powered by Gemini 3.0 Pro</p>
                </div>
            </div>
            <div className="hidden sm:block">
               <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">v1.2.3</span>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Column */}
            <div className="lg:col-span-5 space-y-8">
                <TickerSelector 
                    selectedTicker={selectedTicker} 
                    onSelect={handleTickerChange} 
                />
                
                <TechnicalForm 
                    data={techData} 
                    onChange={setTechData}
                    isAnalyzing={isAnalyzing}
                    onAnalyze={handleAnalyze}
                />
            </div>

            {/* Output Column */}
            <div className="lg:col-span-7">
                {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                
                {!analysis && !isAnalyzing && !error && (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-500 min-h-[400px]">
                        <BrainCircuit className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Ready to Analyze</p>
                        <p className="text-sm max-w-xs mt-2 opacity-60">Select a ticker and fill in the technical levels to generate a professional market report.</p>
                    </div>
                )}

                <AnalysisDisplay response={analysis} ticker={selectedTicker} />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;