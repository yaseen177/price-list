import { useState, useMemo, useEffect } from 'react';

// --- Types ---
type LensType = 'Single Vision' | 'Basic Varifocal' | 'Elite Varifocal' | 'Individual Varifocal';
type LensIndex = '1.5' | '1.6' | '1.67' | '1.74';
type Coating = 'None' | 'MAR' | 'Blue Filter';
type LightProtection = 'None' | 'Transitions' | 'XtrActive Transitions' | 'Solid Tint';

// --- Pricing Logic ---
const getLensBasePrice = (type: LensType, index: LensIndex, isOwnFrame: boolean): number => {
  if (type === 'Single Vision') {
    const newPrices = { '1.5': 0, '1.6': 35, '1.67': 100, '1.74': 149 };
    const ownPrices = { '1.5': 59, '1.6': 94, '1.67': 159, '1.74': 208 };
    return isOwnFrame ? ownPrices[index] : newPrices[index];
  }
  const baseVarifocal = type === 'Basic Varifocal' ? { new: [119, 184, 214, 264], own: [139, 204, 234, 284] } :
                        type === 'Elite Varifocal' ? { new: [139, 234, 264, 314], own: [159, 254, 284, 334] } :
                        { new: [199, 294, 314, 374], own: [219, 314, 334, 394] };
  
  const idxMap = { '1.5': 0, '1.6': 1, '1.67': 2, '1.74': 3 };
  return isOwnFrame ? baseVarifocal.own[idxMap[index]] : baseVarifocal.new[idxMap[index]];
};

const getCoatingPrice = (coating: Coating): number => {
  switch (coating) {
    case 'MAR': return 25;
    case 'Blue Filter': return 45;
    default: return 0;
  }
};

const getLightProtectionPrice = (protection: LightProtection, type: LensType): number => {
  if (protection === 'Transitions') return type === 'Single Vision' ? 45 : 69; 
  if (protection === 'XtrActive Transitions') return 65;
  if (protection === 'Solid Tint') return 25;
  return 0;
};

// --- Reusable Table Cell Component ---
const TableCell = ({ isSelected, onClick, children, colSpan = 1 }: { isSelected: boolean, onClick: () => void, children: React.ReactNode, colSpan?: number }) => (
  <td
    colSpan={colSpan}
    onClick={onClick}
    className={`p-3 border border-gray-300 text-center cursor-pointer transition-colors text-sm sm:text-base ${
      isSelected ? 'bg-[#3f9185] text-white font-bold shadow-inner' : 'bg-white text-gray-700 hover:bg-[#3f9185]/10'
    }`}
  >
    {children}
  </td>
);

// --- Varifocal Simulator ---
const VarifocalDemo = ({ readingAdd }: { readingAdd: number }) => {
  const scenarios = [
    { id: 'tv-phone', name: 'Relaxing', img: '/tv.jpg', bgPos: 'center 10%' },
    { id: 'driving', name: 'Driving', img: '/car.jpg', bgPos: 'center 10%' },
    { id: 'meeting', name: 'Board Meeting', img: '/meeting.jpg', bgPos: 'center 10%' },
  ];
  const [activeScenario, setActiveScenario] = useState(scenarios[0]);
  const getCorridorWidths = (tier: 'Basic' | 'Elite' | 'Individual') => {
    let baseNear = tier === 'Basic' ? 40 : tier === 'Elite' ? 65 : 90;
    let nearPenalty = tier === 'Basic' ? 14 : tier === 'Elite' ? 9 : 4;
    const addFactor = Math.max(0, readingAdd - 1.0); 
    return { nearWidth: Math.max(15, baseNear - (addFactor * nearPenalty)) };
  };

  return (
    <div className="mt-6 p-6 bg-slate-800 rounded-xl text-white shadow-inner">
      <h3 className="text-lg font-bold mb-2">Live Varifocal Visualiser</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {scenarios.map(s => (
          <button key={s.id} onClick={() => setActiveScenario(s)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeScenario.id === s.id ? 'bg-[#3f9185] text-white' : 'bg-slate-700 text-slate-300'}`}>{s.name}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Basic', 'Elite', 'Individual'] as const).map((tier) => {
          const { nearWidth } = getCorridorWidths(tier);
          return (
            <div key={tier} className="flex flex-col items-center">
              <h4 className="font-semibold text-[#3f9185] bg-white px-3 py-1 rounded-full text-sm mb-3 shadow">{tier}</h4>
              <div className="relative w-full h-64 bg-slate-200 rounded-t-[40%] rounded-b-[40%] overflow-hidden border-4 border-slate-600 shadow-lg" style={{ backgroundImage: `url('${activeScenario.img}')`, backgroundSize: 'cover', backgroundPosition: activeScenario.bgPos }}>
                <div className="absolute bottom-0 left-0 bg-white/30 backdrop-blur-md z-10" style={{ height: '60%', width: `calc(50% - ${nearWidth/2}%)`, borderTopRightRadius: '100% 100%' }} />
                <div className="absolute bottom-0 right-0 bg-white/30 backdrop-blur-md z-10" style={{ height: '60%', width: `calc(50% - ${nearWidth/2}%)`, borderTopLeftRadius: '100% 100%' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- Balance Scale Visualiser Component ---
const BalanceScale = ({ 
  weightA, weightB, pathA, pathB, thickA, thickB, thinnerLens, lighterLens, thickDiffText, weightDiffText 
}: { 
  weightA: number, weightB: number, pathA: string, pathB: string, thickA: string, thickB: string, thinnerLens: string, lighterLens: string, thickDiffText: string, weightDiffText: string 
}) => {
  const maxTilt = 16; 
  const maxWeight = Math.max(weightA, weightB);
  const diffRatio = maxWeight === 0 ? 0 : (weightB - weightA) / maxWeight;
  const angle = diffRatio * maxTilt;

  return (
    <div className="flex flex-col items-center justify-end w-full h-[400px] lg:h-[480px] relative bg-white border-2 border-gray-100 rounded-3xl shadow-sm pb-24 mt-4">
      
      {/* Dynamic Results Header */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center px-4 text-center z-20">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Live Result</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {lighterLens !== 'EQUAL' && weightA !== 0 && (
            <span className="px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
              Lens {lighterLens} is {weightDiffText}
            </span>
          )}
          {thinnerLens !== 'EQUAL' && weightA !== 0 && (
            <span className="px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
              Lens {thinnerLens} is {thickDiffText}
            </span>
          )}
        </div>
      </div>
      
      {/* The Main Beam */}
      <div className="w-[280px] md:w-[480px] h-3 bg-slate-800 rounded-full relative transition-transform duration-1000 ease-out z-10" style={{ transform: `rotate(${angle}deg)` }}>
        
        {/* === LEFT SIDE === */}
        {/* Left Pan & Lens (Sitting ON TOP of the beam) */}
        <div className="absolute left-0 bottom-full w-32 md:w-36 -translate-x-1/2 transition-transform duration-1000 ease-out origin-bottom flex flex-col items-center" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="w-full h-32 md:h-40 flex items-end justify-center -mb-2 z-10">
            <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-xl">
              <path d={pathA} fill="#3b82f6" fillOpacity="0.4" stroke="#2563eb" strokeWidth="2.5" className="transition-all duration-700 ease-out" />
            </svg>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full shadow-lg z-0"></div>
          <div className="w-3 h-3 bg-slate-500 rounded-b-sm z-0"></div>
        </div>
        
        {/* Left Stats Box (Hanging BELOW the beam) */}
        <div className="absolute left-0 top-full mt-3 w-32 md:w-36 -translate-x-1/2 transition-transform duration-1000 ease-out origin-top flex flex-col items-center" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur px-4 py-3 rounded-xl border-2 border-gray-200 shadow-md w-full">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lens A</span>
            <div className={`font-black text-2xl md:text-3xl leading-none mt-1 ${lighterLens === 'A' ? 'text-emerald-500' : lighterLens === 'B' ? 'text-red-500' : 'text-slate-700'}`}>{weightA}g</div>
            <div className={`text-xs font-bold mt-1 ${thinnerLens === 'A' ? 'text-emerald-500' : thinnerLens === 'B' ? 'text-red-500' : 'text-slate-500'}`}>{thickA}mm</div>
          </div>
        </div>

        {/* === RIGHT SIDE === */}
        {/* Right Pan & Lens (Sitting ON TOP of the beam) */}
        <div className="absolute right-0 bottom-full w-32 md:w-36 translate-x-1/2 transition-transform duration-1000 ease-out origin-bottom flex flex-col items-center" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="w-full h-32 md:h-40 flex items-end justify-center -mb-2 z-10">
            <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible drop-shadow-xl">
              <path d={pathB} fill="#3b82f6" fillOpacity="0.4" stroke="#2563eb" strokeWidth="2.5" className="transition-all duration-700 ease-out" />
            </svg>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full shadow-lg z-0"></div>
          <div className="w-3 h-3 bg-slate-500 rounded-b-sm z-0"></div>
        </div>

        {/* Right Stats Box (Hanging BELOW the beam) */}
        <div className="absolute right-0 top-full mt-3 w-32 md:w-36 translate-x-1/2 transition-transform duration-1000 ease-out origin-top flex flex-col items-center" style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur px-4 py-3 rounded-xl border-2 border-gray-200 shadow-md w-full">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lens B</span>
            <div className={`font-black text-2xl md:text-3xl leading-none mt-1 ${lighterLens === 'B' ? 'text-emerald-500' : lighterLens === 'A' ? 'text-red-500' : 'text-slate-700'}`}>{weightB}g</div>
            <div className={`text-xs font-bold mt-1 ${thinnerLens === 'B' ? 'text-emerald-500' : thinnerLens === 'A' ? 'text-red-500' : 'text-slate-500'}`}>{thickB}mm</div>
          </div>
        </div>

        {/* Center Pivot Point */}
        <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-slate-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 border-[4px] border-slate-800 shadow"></div>
      </div>
      
      {/* Fulcrum Base */}
      <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[80px] border-b-slate-300 z-0 -mt-2"></div>
      <div className="w-48 h-4 bg-slate-200 rounded-full mt-0 shadow-inner"></div>
    </div>
  );
};


// --- UNIFIED Lens Thickness & Comparison Modal ---
const LensThicknessVisualiser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'compare' | 'grid'>('compare');
  const [prescription, setPrescription] = useState(-6.00);
  const [indexA, setIndexA] = useState<LensIndex>('1.5');
  const [indexB, setIndexB] = useState<LensIndex>('1.74');

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const indicesData: Record<LensIndex, { n: number, density: number, label: string }> = {
    '1.5': { n: 1.498, density: 1.32, label: '1.5' },
    '1.6': { n: 1.600, density: 1.30, label: '1.6' },
    '1.67': { n: 1.667, density: 1.35, label: '1.67' },
    '1.74': { n: 1.740, density: 1.47, label: '1.74' },
  };

  const calculateMetrics = (p: number, indexLabel: LensIndex) => {
    const data = indicesData[indexLabel];
    const absP = Math.abs(p);
    const isPlus = p > 0;
    
    let visualDrama = 1;
    if (data.n < 1.55) visualDrama = 3.2;
    else if (data.n < 1.65) visualDrama = 2.0;
    else if (data.n < 1.7) visualDrama = 1.3;
    else visualDrama = 0.8;
    
    let thickFactor = 1.0;
    if (data.n < 1.55) thickFactor = 1.00;
    else if (data.n < 1.65) thickFactor = 0.80; 
    else if (data.n < 1.7) thickFactor = 0.68;  
    else thickFactor = 0.58;                    
    
    let edgeThick = 4;
    let centerThick = 4;
    
    if (p === 0) {
      edgeThick = 4; centerThick = 4;
    } else if (isPlus) {
      edgeThick = 3; 
      centerThick = 3 + (absP * visualDrama * 1.4);
    } else {
      centerThick = 2; 
      edgeThick = 2 + (absP * visualDrama * 1.4);
    }

    const realisticThickMm = p === 0 ? 1.5 : 1.5 + (absP * 0.85 * thickFactor);
    
    const weightBase = 12; 
    const weightAdded = absP * 4.5 * thickFactor * (data.density / 1.32);
    const weight = p === 0 ? weightBase : Math.round(weightBase + weightAdded);

    return { edgeThick, centerThick, weight, displayThickMm: realisticThickMm, n: data.n, label: data.label };
  };

  const getLensPathVertical = (p: number, edgeThick: number, centerThick: number) => {
    const isPlus = p > 0;
    if (p === 0) return "M 58,10 Q 58,60 58,110 L 62,110 Q 62,60 62,10 Z";
    if (isPlus) {
      const halfThick = centerThick / 2;
      const halfEdge = edgeThick / 2; 
      return `M ${60 - halfEdge},10 Q ${60 - halfThick},60 ${60 - halfEdge},110 L ${60 + halfEdge},110 Q ${60 + halfThick},60 ${60 + halfEdge},10 Z`;
    } else {
      const halfThick = edgeThick / 2;
      const halfCenter = centerThick / 2; 
      return `M ${60 - halfThick},10 Q ${60 - halfCenter},60 ${60 - halfThick},110 L ${60 + halfThick},110 Q ${60 + halfCenter},60 ${60 + halfThick},10 Z`;
    }
  };

  const metricsA = calculateMetrics(prescription, indexA);
  const metricsB = calculateMetrics(prescription, indexB);

  const thinnerLens = metricsA.displayThickMm < metricsB.displayThickMm ? 'A' : metricsB.displayThickMm < metricsA.displayThickMm ? 'B' : 'EQUAL';
  const lighterLens = metricsA.weight < metricsB.weight ? 'A' : metricsB.weight < metricsA.weight ? 'B' : 'EQUAL';

  const getThicknessDiffText = () => {
    if (thinnerLens === 'EQUAL' || prescription === 0) return "Identical Thickness";
    const baseThickness = 1.5; 
    const addedA = Math.max(0, metricsA.displayThickMm - baseThickness);
    const addedB = Math.max(0, metricsB.displayThickMm - baseThickness);
    
    const maxAdded = Math.max(addedA, addedB);
    const diffAdded = Math.abs(addedA - addedB);
    
    const pct = Math.round((diffAdded / maxAdded) * 100);
    return ` ${pct}% Thinner`;
  };

  const getWeightDiffText = () => {
    if (lighterLens === 'EQUAL' || prescription === 0) return "Identical Weight";
    const diff = Math.abs(metricsA.weight - metricsB.weight);
    const maxWeight = Math.max(metricsA.weight, metricsB.weight);
    const pct = Math.round((diff / maxWeight) * 100);
    return `${pct}% Lighter`;
  };

  return (
    <>
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-white">Lens Thickness & Weight Visualiser</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Compare physical profiles and weight across different refractive indices.</p>
          </div>
          <button 
            onClick={() => setIsOpen(true)} 
            className="px-10 py-3 bg-[#3f9185] text-white font-black rounded-xl shadow-lg hover:scale-105 transition-all uppercase tracking-widest text-xs whitespace-nowrap"
          >
            Launch Visualiser
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          
          <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col relative border-4 border-[#3f9185] overflow-hidden">
            
            {/* Pinned Header with Tabs */}
            <div className="shrink-0 bg-white border-b border-gray-200 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center z-20 gap-4">
              <div className="w-full md:w-auto flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lens Weigh-In</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="md:hidden w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 hover:text-red-500 transition-colors text-xl">✕</button>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('compare')}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${activeTab === 'compare' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Head-to-Head
                </button>
                <button 
                  onClick={() => setActiveTab('grid')}
                  className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${activeTab === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  All Indices
                </button>
              </div>

              <button onClick={() => setIsOpen(false)} className="hidden md:flex w-10 h-10 bg-gray-100 rounded-full items-center justify-center font-bold text-gray-500 hover:bg-gray-200 hover:text-red-500 transition-colors text-xl">✕</button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              
              {activeTab === 'compare' ? (
                /* --- HEAD TO HEAD VIEW --- */
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Controls */}
                  <div className="w-full lg:w-[35%] flex flex-col gap-6 shrink-0">
                    
                    <div className="bg-white p-6 rounded-2xl border-2 border-[#3f9185]/30 shadow-md flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Prescription</span>
                        <span className={`text-2xl font-mono font-black px-4 py-1.5 rounded-lg border-2 shadow-inner ${prescription > 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : prescription < 0 ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-white'}`}>
                          {prescription > 0 ? '+' : ''}{prescription.toFixed(2)}
                        </span>
                      </div>
                      <input 
                        type="range" min="-10" max="8" step="0.25" value={prescription} 
                        onChange={(e) => setPrescription(parseFloat(e.target.value))} 
                        className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#3f9185]" 
                      />
                      <div className="flex justify-between text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">
                        <span>Minus (-10)</span>
                        <span>Plano</span>
                        <span>Plus (+8)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                      <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm text-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Select Lens A</label>
                        <select 
                          value={indexA} onChange={(e) => setIndexA(e.target.value as any)}
                          className="w-full p-3 text-center text-lg font-black text-slate-700 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-[#3f9185] outline-none cursor-pointer uppercase tracking-widest"
                        >
                          <option value="1.5">Index 1.5</option><option value="1.6">Index 1.6</option><option value="1.67">Index 1.67</option><option value="1.74">Index 1.74</option>
                        </select>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm text-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Select Lens B</label>
                        <select 
                          value={indexB} onChange={(e) => setIndexB(e.target.value as any)}
                          className="w-full p-3 text-center text-lg font-black text-[#3f9185] bg-[#3f9185]/10 rounded-xl border-2 border-[#3f9185]/20 focus:border-[#3f9185] outline-none cursor-pointer uppercase tracking-widest"
                        >
                          <option value="1.5">Index 1.5</option><option value="1.6">Index 1.6</option><option value="1.67">Index 1.67</option><option value="1.74">Index 1.74</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Balance Scale */}
                  <div className="w-full lg:w-[65%] flex items-center justify-center lg:pt-0">
                    <BalanceScale 
                      weightA={metricsA.weight} 
                      weightB={metricsB.weight} 
                      pathA={getLensPathVertical(prescription, metricsA.edgeThick, metricsA.centerThick)}
                      pathB={getLensPathVertical(prescription, metricsB.edgeThick, metricsB.centerThick)}
                      thickA={metricsA.displayThickMm.toFixed(1)}
                      thickB={metricsB.displayThickMm.toFixed(1)}
                      lighterLens={lighterLens} 
                      thinnerLens={thinnerLens}
                      weightDiffText={getWeightDiffText()} 
                      thickDiffText={getThicknessDiffText()}
                    />
                  </div>
                </div>
              ) : (
                /* --- ALL INDICES GRID VIEW --- */
                <div className="flex flex-col">
                  <div className="mb-10 bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Prescription Slider</span>
                      <span className={`text-3xl font-mono font-black px-6 py-2 rounded-xl border-2 shadow-sm ${prescription > 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : prescription < 0 ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 border-gray-200 bg-white'}`}>
                        {prescription > 0 ? '+' : ''}{prescription.toFixed(2)}
                      </span>
                    </div>
                    <input 
                      type="range" min="-10" max="8" step="0.25" value={prescription} 
                      onChange={(e) => setPrescription(parseFloat(e.target.value))} 
                      className="w-full h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#3f9185]" 
                    />
                    <div className="flex justify-between text-xs font-black text-gray-400 mt-4 uppercase tracking-widest">
                      <span>High Minus (-10)</span>
                      <span>Plano (0.00)</span>
                      <span>High Plus (+8)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(['1.5', '1.6', '1.67', '1.74'] as LensIndex[]).map((label) => {
                      const { edgeThick, centerThick, weight, displayThickMm } = calculateMetrics(prescription, label);
                      
                      return (
                        <div key={label} className="bg-white rounded-2xl p-6 border-2 border-gray-100 flex flex-col items-center shadow-md hover:border-blue-200 transition-colors">
                          <span className="text-lg font-black text-slate-800 mb-6 tracking-widest uppercase">INDEX {label}</span>
                          
                          <div className="w-full h-48 md:h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 shadow-inner overflow-hidden">
                            <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible p-2">
                              <path 
                                d={getLensPathVertical(prescription, edgeThick, centerThick)} 
                                fill="#3b82f6" 
                                fillOpacity="0.3" 
                                stroke="#2563eb" 
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out drop-shadow-md"
                              />
                            </svg>
                          </div>

                          <div className="w-full mt-8 space-y-4">
                            <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Max Thickness</span>
                              <span className="text-lg font-black text-slate-800">
                                {prescription === 0 ? "2.0mm" : `${displayThickMm.toFixed(1)}mm`}
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Est. Weight</span>
                              <span className="text-lg font-black text-slate-800">
                                {weight}g
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default function App() {
  const [customerName, setCustomerName] = useState('');
  const [isOwnFrame, setIsOwnFrame] = useState(false);
  const [framePrice, setFramePrice] = useState(0);
  const [lensType, setLensType] = useState<LensType>('Single Vision');
  const [lensIndex, setLensIndex] = useState<LensIndex>('1.5');
  const [coating, setCoating] = useState<Coating>('None');
  const [lightProtection, setLightProtection] = useState<LightProtection>('None');
  const [showDemo, setShowDemo] = useState(false);
  const [readingAdd, setReadingAdd] = useState(2.00);

  const lensBaseCost = useMemo(() => getLensBasePrice(lensType, lensIndex, isOwnFrame), [lensType, lensIndex, isOwnFrame]);
  const coatingCost = useMemo(() => getCoatingPrice(coating), [coating]);
  const protectionCost = useMemo(() => getLightProtectionPrice(lightProtection, lensType), [lightProtection, lensType]);
  const totalCost = (isOwnFrame ? 0 : (framePrice || 0)) + lensBaseCost + coatingCost + protectionCost;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-white py-6 px-8 flex justify-center border-b-4 border-[#3f9185]">
          <img src="https://img1.wsimg.com/isteam/ip/297dd456-b70f-4175-b7e6-7f1aabf6e6b3/blob-0f9c396.png/:/rs=w:315,h:63,cg:true,m/cr=w:315,h:63/qt=q:95" alt="Logo" className="h-14 object-contain" />
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Patient Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name..." className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-[#3f9185] bg-gray-50 outline-none font-bold transition-all" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frame Choice</label>
              <div className="flex bg-gray-100 p-1 rounded-xl border-2 border-gray-100">
                <button onClick={() => setIsOwnFrame(false)} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${!isOwnFrame ? 'bg-[#3f9185] text-white shadow-lg' : 'text-gray-400'}`}>New Frame</button>
                <button onClick={() => setIsOwnFrame(true)} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-widest ${isOwnFrame ? 'bg-[#3f9185] text-white shadow-lg' : 'text-gray-400'}`}>Own Frame</button>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${isOwnFrame ? 'text-gray-200' : 'text-gray-400'}`}>Frame Price (£)</label>
              <input type="number" disabled={isOwnFrame} value={framePrice || ''} onChange={(e) => setFramePrice(parseFloat(e.target.value))} placeholder="0.00" className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 outline-none font-black text-lg transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 shadow-sm">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b-2 border-gray-100">
                  <th className="p-4 bg-gray-50 text-left text-[10px] font-black uppercase text-gray-400 w-1/5 tracking-[0.2em]">Lens Type</th>
                  <TableCell isSelected={lensType === 'Single Vision'} onClick={() => { setLensType('Single Vision'); setShowDemo(false); }}>Single Vision</TableCell>
                  <TableCell isSelected={lensType === 'Basic Varifocal'} onClick={() => setLensType('Basic Varifocal')}>Basic Varifocal</TableCell>
                  <TableCell isSelected={lensType === 'Elite Varifocal'} onClick={() => setLensType('Elite Varifocal')}>Elite Varifocal</TableCell>
                  <TableCell isSelected={lensType === 'Individual Varifocal'} onClick={() => setLensType('Individual Varifocal')}>Individual Varifocal</TableCell>
                </tr>
                <tr className="border-b-2 border-gray-100">
                  <th className="p-4 bg-gray-50 text-left text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Index</th>
                  <TableCell isSelected={lensIndex === '1.5'} onClick={() => setLensIndex('1.5')}>1.5<br/><span className="text-[9px] uppercase opacity-50 font-bold">Standard</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.6'} onClick={() => setLensIndex('1.6')}>1.6<br/><span className="text-[9px] uppercase opacity-50 font-bold">Thin</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.67'} onClick={() => setLensIndex('1.67')}>1.67<br/><span className="text-[9px] uppercase opacity-50 font-bold">Extra Thin</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.74'} onClick={() => setLensIndex('1.74')}>1.74<br/><span className="text-[9px] uppercase opacity-50 font-bold">Super Thin</span></TableCell>
                </tr>
                <tr className="border-b-2 border-gray-100">
                  <th className="p-4 bg-gray-50 text-left text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Coating</th>
                  <TableCell isSelected={coating === 'None'} onClick={() => setCoating('None')} colSpan={2}>Uncoated</TableCell>
                  <TableCell isSelected={coating === 'MAR'} onClick={() => setCoating('MAR')}>MAR (+£25)</TableCell>
                  <TableCell isSelected={coating === 'Blue Filter'} onClick={() => setCoating('Blue Filter')}>Blue Filter (+£45)</TableCell>
                </tr>
                <tr>
                  <th className="p-4 bg-gray-50 text-left text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Extras</th>
                  <TableCell isSelected={lightProtection === 'None'} onClick={() => setLightProtection('None')}>Clear</TableCell>
                  <TableCell isSelected={lightProtection === 'Transitions'} onClick={() => setLightProtection('Transitions')}>Transitions (+£{lensType === 'Single Vision' ? 45 : 69})</TableCell>
                  <TableCell isSelected={lightProtection === 'XtrActive Transitions'} onClick={() => setLightProtection('XtrActive Transitions')}>XtrActive (+£65)</TableCell>
                  <TableCell isSelected={lightProtection === 'Solid Tint'} onClick={() => setLightProtection('Solid Tint')}>Tint (+£25)</TableCell>
                </tr>
              </tbody>
            </table>
          </div>

          <LensThicknessVisualiser />

          {lensType.includes('Varifocal') && (
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Varifocal Corridor Visualiser</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Demonstrate vision zones based on Reading Addition.</p>
                </div>
                <button onClick={() => setShowDemo(!showDemo)} className="px-10 py-3 bg-[#3f9185] text-white font-black rounded-xl shadow-lg hover:scale-105 transition-all uppercase tracking-widest text-xs whitespace-nowrap">{showDemo ? 'Close Demo' : 'Launch Demo'}</button>
              </div>
              {showDemo && (
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Reading Addition: <span className="text-[#3f9185] text-xl ml-2">+{readingAdd.toFixed(2)}</span></label>
                  <input type="range" min="1.00" max="3.50" step="0.25" value={readingAdd} onChange={(e) => setReadingAdd(parseFloat(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-[#3f9185] mb-8" />
                  <VarifocalDemo readingAdd={readingAdd} />
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border-2 border-gray-100 p-8 bg-white">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-6">Coating Performance Guide</h3>
            <table className="w-full text-sm text-center border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-400 border-b-2 border-gray-50">
                  <th className="p-4 text-left tracking-widest">Premium Feature</th>
                  <th className="p-4">Standard</th>
                  <th className="p-4">MAR Coating</th>
                  <th className="p-4">Blue Filter</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-700">
                <tr className="border-b-2 border-gray-50">
                  <td className="p-5 text-left text-xs uppercase tracking-tight">Scratch Protection</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                </tr>
                <tr className="border-b-2 border-gray-50">
                  <td className="p-5 text-left text-xs uppercase tracking-tight">Anti-Reflection</td>
                  <td className="p-5 text-gray-200">-</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                </tr>
                <tr className="border-b-2 border-gray-50">
                  <td className="p-5 text-left text-xs uppercase tracking-tight">Easy-Clean Tech</td>
                  <td className="p-5 text-gray-200">-</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                </tr>
                <tr>
                  <td className="p-5 text-left text-xs uppercase tracking-tight">Digital Screen Shield</td>
                  <td className="p-5 text-gray-200">-</td>
                  <td className="p-5 text-gray-200">-</td>
                  <td className="p-5 text-[#3f9185] text-xl">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10">
          <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Total Quote</h2>
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] mt-2">Patient: {customerName || 'Pending Selection'}</p>
            </div>
            <span className="text-[10px] font-black px-4 py-1.5 bg-[#3f9185]/20 text-[#3f9185] border border-[#3f9185]/30 rounded-full uppercase tracking-widest">{isOwnFrame ? 'Reglaze Service' : 'Complete Pair'}</span>
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            {!isOwnFrame && <><span>Selected Frame</span><span className="text-right text-white">£{framePrice || 0}</span></>}
            <span>{lensType} Design</span><span className="text-right text-white">£{lensBaseCost}</span>
            <span>Index {lensIndex} Material</span><span className="text-right text-white">Incl.</span>
            {coatingCost > 0 && <><span>{coating} Coating</span><span className="text-right text-white">£{coatingCost}</span></>}
            {protectionCost > 0 && <><span>Extra: {lightProtection}</span><span className="text-right text-white">£{protectionCost}</span></>}
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center">
            <span className="text-2xl font-black uppercase tracking-tighter">Grand Total</span>
            <span className="text-5xl font-black text-[#3f9185] drop-shadow-[0_0_15px_rgba(63,145,133,0.3)]">£{totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}