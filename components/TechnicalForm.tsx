import React, { useState, useEffect } from 'react';
import { TechnicalData, Timeframe, Preset } from '../types';
import { Clock, TrendingUp, BarChart2, Target, Hash, Save, FolderOpen, Trash2, X, Check } from 'lucide-react';

interface TechnicalFormProps {
  data: TechnicalData;
  onChange: (data: TechnicalData) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const timeframes: Timeframe[] = ['2h', '4h', '1D', '1W'];

interface InputGroupProps {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon: Icon, children, action }) => (
  <div className="bg-gray-850 p-5 rounded-xl border border-gray-750 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-200 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-brand-500" />
        {label}
      </h3>
      {action && <div>{action}</div>}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

interface LabelInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const LabelInput: React.FC<LabelInputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
    />
  </div>
);

const TechnicalForm: React.FC<TechnicalFormProps> = ({ data, onChange, isAnalyzing, onAnalyze }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('crypto_analysis_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse presets", e);
      }
    }
  }, []);

  const savePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      data: { ...data },
      timestamp: Date.now()
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('crypto_analysis_presets', JSON.stringify(updatedPresets));
    setPresetName('');
    setShowSaveInput(false);
  };

  const loadPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onChange({ ...preset.data });
    }
  };

  const deletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem('crypto_analysis_presets', JSON.stringify(updatedPresets));
  };
  
  const updateNested = (category: keyof TechnicalData, key: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange({ ...data, [category]: { ...(data[category] as any), [key]: value } });
  };

  return (
    <div className="space-y-6">
      
      {/* Presets Bar */}
      <div className="bg-gray-850 p-3 rounded-xl border border-gray-750 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FolderOpen className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Load Preset:</span>
          <select 
            className="bg-gray-950 border border-gray-700 rounded text-sm text-white py-1 px-2 focus:outline-none focus:border-brand-500 w-full sm:w-48"
            onChange={(e) => loadPreset(e.target.value)}
            value=""
          >
            <option value="" disabled>Select a preset...</option>
            {presets.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({new Date(p.timestamp).toLocaleDateString()})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {showSaveInput ? (
                <div className="flex items-center gap-2 animate-fade-in w-full sm:w-auto">
                    <input 
                        type="text" 
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Preset Name"
                        className="bg-gray-950 border border-gray-700 rounded text-sm text-white py-1 px-2 focus:outline-none focus:border-brand-500 w-full"
                    />
                    <button onClick={savePreset} className="p-1.5 bg-brand-600 hover:bg-brand-500 rounded text-white"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setShowSaveInput(false)} className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <button 
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center text-sm bg-gray-950 hover:bg-gray-900 border border-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors w-full sm:w-auto justify-center"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Current
                </button>
            )}
        </div>
      </div>

      {/* Helper to manage/delete presets if any exist */}
      {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                  <div key={p.id} className="group flex items-center text-xs bg-gray-900 border border-gray-800 rounded px-2 py-1 text-gray-400">
                      {p.name}
                      <button 
                        onClick={() => deletePreset(p.id)}
                        className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Preset"
                      >
                          <Trash2 className="w-3 h-3" />
                      </button>
                  </div>
              ))}
          </div>
      )}
      
      {/* Current Price */}
      <div className="bg-gray-850 p-4 rounded-xl border border-gray-750 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="w-full">
            <label className="text-xs text-gray-400 mb-1 block uppercase font-bold">Current Price / Context</label>
            <input 
                type="text" 
                value={data.currentPrice} 
                onChange={(e) => onChange({...data, currentPrice: e.target.value})}
                placeholder="e.g. 96,500 or 'Consolidating at range high'"
                className="w-full bg-gray-950 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            />
        </div>
      </div>

      <InputGroup label="Support / Resistance" icon={TrendingUp}>
        {timeframes.map(tf => (
          <LabelInput 
            key={`sr-${tf}`} 
            label={`${tf} Level`} 
            value={data.supportResistance[tf]} 
            onChange={(v) => updateNested('supportResistance', tf, v)}
            placeholder={`e.g. ${tf === '2h' ? '96k' : '95k'}`}
          />
        ))}
      </InputGroup>

      <InputGroup label="Weekly Sweeps (Liquidity)" icon={BarChart2}>
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabelInput 
                label="Last Sweep (Event 1)" 
                value={data.weeklySweep.sweep1} 
                onChange={(v) => updateNested('weeklySweep', 'sweep1', v)}
                placeholder="e.g. Swept Monday Low at 94,200"
            />
             <LabelInput 
                label="Previous Sweep (Event 2)" 
                value={data.weeklySweep.sweep2} 
                onChange={(v) => updateNested('weeklySweep', 'sweep2', v)}
                placeholder="e.g. Swept Previous Week High at 98,000"
            />
        </div>
      </InputGroup>

      <InputGroup label="FVG Fibs" icon={Hash}>
        {timeframes.map(tf => (
          <LabelInput 
            key={`fvg-${tf}`} 
            label={`${tf} FVG`} 
            value={data.fvgFibs[tf]} 
            onChange={(v) => updateNested('fvgFibs', tf, v)}
            placeholder="e.g. 0.5 @ 96,100"
          />
        ))}
      </InputGroup>

      <InputGroup label="Candle Fibs" icon={Target}>
        {timeframes.map(tf => (
          <LabelInput 
            key={`candle-${tf}`} 
            label={`${tf} Candle`} 
            value={data.candleFibs[tf]} 
            onChange={(v) => updateNested('candleFibs', tf, v)}
            placeholder="e.g. 0.618 @ 95,800"
          />
        ))}
      </InputGroup>

      <InputGroup 
        label="Time Vertical Fibs" 
        icon={Clock}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-bold">Context:</span>
            <select
              value={data.timeFibsTimeframe || '2h'}
              onChange={(e) => onChange({...data, timeFibsTimeframe: e.target.value as Timeframe})}
              className="bg-gray-950 border border-gray-700 rounded text-xs text-brand-400 py-1 px-2 focus:outline-none focus:border-brand-500"
            >
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf} Chart</option>
              ))}
            </select>
          </div>
        }
      >
        <LabelInput label="Time 0.0 (Start)" value={data.timeFibs.t0} onChange={(v) => updateNested('timeFibs', 't0', v)} placeholder="Date/Time" />
        <LabelInput label="Time 0.618" value={data.timeFibs.t0_618} onChange={(v) => updateNested('timeFibs', 't0_618', v)} placeholder="Date/Time" />
        <LabelInput label="Time 0.786" value={data.timeFibs.t0_786} onChange={(v) => updateNested('timeFibs', 't0_786', v)} placeholder="Date/Time" />
        <LabelInput label="Time 1.618 (Extension)" value={data.timeFibs.t1_618} onChange={(v) => updateNested('timeFibs', 't1_618', v)} placeholder="Date/Time" />
      </InputGroup>

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`
            w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg
            flex items-center justify-center transition-all duration-300
            ${isAnalyzing 
                ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                : 'bg-gradient-to-r from-brand-600 to-blue-700 hover:from-brand-500 hover:to-blue-600 text-white shadow-brand-500/20'
            }
        `}
      >
        {isAnalyzing ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Analysis...
            </>
        ) : (
            'Generate AI Analysis'
        )}
      </button>
    </div>
  );
};

export default TechnicalForm;