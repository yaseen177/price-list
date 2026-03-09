import { useState, useMemo } from 'react';

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

// --- Weight Scale Visualiser Component ---
const WeightScale = ({ weight }: { weight: number }) => {
  const maxWeight = 100; // max expected weight in grams for the demo dial
  const rotation = Math.min(180, (Math.max(0, weight) / maxWeight) * 180) - 90; 

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-8 overflow-hidden mt-1">
        {/* Scale Dial Background */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-slate-50 rounded-full border-[3px] border-slate-200 shadow-inner"></div>
        {/* Tick marks */}
        <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-t-[3px] border-blue-500 opacity-30 transform -rotate-45"></div>
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-[2px] h-7 bg-slate-800 origin-bottom transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        ></div>
        {/* Centre pin */}
        <div className="absolute bottom-[-3px] left-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full transform -translate-x-1/2 shadow"></div>
      </div>
      <span className="text-xs font-black text-slate-700 mt-1">{weight}g</span>
    </div>
  );
};

// --- Vertical Refractive Index Simulator Component (Pop-Up Modal) ---
const IndexDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prescription, setPrescription] = useState(-6.00);
  const indices: { label: '1.5' | '1.6' | '1.67' | '1.74'; n: number; density: number }[] = [
    { label: '1.5', n: 1.498, density: 1.32 },
    { label: '1.6', n: 1.600, density: 1.30 },
    { label: '1.67', n: 1.667, density: 1.35 },
    { label: '1.74', n: 1.740, density: 1.47 },
  ];

  // Exaggerated calculations for maximum visual drama
  const calculateMetrics = (p: number, n: number, density: number) => {
    const absP = Math.abs(p);
    const isPlus = p > 0;
    
    // Custom visual multipliers to create a huge dramatic difference between 1.5 and 1.74
    let visualDrama = 1;
    if (n < 1.55) visualDrama = 6.0;      // 1.5: Extremely thick
    else if (n < 1.65) visualDrama = 3.5; // 1.6: Noticeably thinner
    else if (n < 1.7) visualDrama = 2.0;  // 1.67: Quite thin
    else visualDrama = 1.0;               // 1.74: Razor thin
    
    let edgeThick = 4;
    let centerThick = 4;
    let sag = 0;
    
    if (p === 0) {
      edgeThick = 4;
      centerThick = 4;
    } else if (isPlus) {
      edgeThick = 3; 
      sag = absP * visualDrama * 1.8; // Massive centre bulge
      centerThick = 3 + sag;
    } else {
      centerThick = 2; 
      sag = absP * visualDrama * 1.8; // Massive edge flare
      edgeThick = 2 + sag;
    }

    // Keep the displayed mm numbers realistic so the quote makes sense physically
    const realisticThickMm = p === 0 ? 2.0 : (isPlus ? 2 + (absP * 0.4 * (1.5/n)) : 1.5 + (absP * 0.5 * (1.5/n)));
    
    // Weight: Calculate based on the exaggerated volume but scaled down to realistic grams
    const averageThick = (centerThick + edgeThick) / 2;
    const weight = p === 0 ? 12 : Math.round(averageThick * (density / 1.32) * 1.6); 

    return { edgeThick, centerThick, weight, displayThickMm: realisticThickMm };
  };

  const getLensPathVertical = (p: number, edgeThick: number, centerThick: number) => {
    const isPlus = p > 0;
    // We use a 120x120 canvas to give the massive thicknesses room to breathe
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

  return (
    <>
      {/* Launch Button Section */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Lens Thickness Visualiser</h3>
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

      {/* Full-Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 border-b border-gray-100 p-6 md:p-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lens Thickness & Weight Profile</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Drag the slider to observe how standard plastic compares to high-index materials.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* Slider Controls */}
              <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
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

              {/* Lens Profiles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {indices.map((item) => {
                  const { edgeThick, centerThick, weight, displayThickMm } = calculateMetrics(prescription, item.n, item.density);
                  
                  return (
                    <div key={item.label} className="bg-white rounded-2xl p-6 border-2 border-gray-100 flex flex-col items-center shadow-md hover:border-blue-200 transition-colors">
                      <span className="text-lg font-black text-slate-800 mb-6 tracking-widest uppercase">INDEX {item.label}</span>
                      
                      {/* Dynamic SVG Lens Profile - TALLER */}
<div className="w-full h-64 md:h-96 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 shadow-inner overflow-hidden">
  {/* The tighter viewBox (20 0 80 120) trims the empty sides, forcing the lens to scale up vertically */}
  <svg viewBox="20 0 80 120" preserveAspectRatio="none" className="w-full h-full overflow-visible p-2">
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
                        
                        {/* Weight Scale Visualiser */}
                        <div className="flex flex-col items-center pt-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-2">Total Weight</span>
                            <WeightScale weight={weight} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {/* New Index Visualiser Trigger Button */}
          <IndexDemo />

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