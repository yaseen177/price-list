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
  if (type === 'Basic Varifocal') {
    const newPrices = { '1.5': 119, '1.6': 184, '1.67': 214, '1.74': 264 };
    const ownPrices = { '1.5': 139, '1.6': 204, '1.67': 234, '1.74': 284 };
    return isOwnFrame ? ownPrices[index] : newPrices[index];
  }
  if (type === 'Elite Varifocal') {
    const newPrices = { '1.5': 139, '1.6': 234, '1.67': 264, '1.74': 314 };
    const ownPrices = { '1.5': 159, '1.6': 254, '1.67': 284, '1.74': 334 };
    return isOwnFrame ? ownPrices[index] : newPrices[index];
  }
  if (type === 'Individual Varifocal') {
    const newPrices = { '1.5': 199, '1.6': 294, '1.67': 314, '1.74': 374 };
    const ownPrices = { '1.5': 219, '1.6': 314, '1.67': 334, '1.74': 394 };
    return isOwnFrame ? ownPrices[index] : newPrices[index];
  }
  return 0;
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
      isSelected
        ? 'bg-[#3f9185] text-white font-bold shadow-inner'
        : 'bg-white text-gray-700 hover:bg-[#3f9185]/10'
    }`}
  >
    {children}
  </td>
);

// --- Advanced Varifocal Corridor Simulator Component ---
const VarifocalDemo = ({ readingAdd }: { readingAdd: number }) => {
  const scenarios = [
    { 
      id: 'tv-phone', 
      name: 'Relaxing', 
      img: '/tv.jpg',
      bgPos: 'center 10%' 
    },
    { 
      id: 'driving', 
      name: 'Driving', 
      img: '/car.jpg',
      bgPos: 'center 10%'
    },
    { 
      id: 'meeting', 
      name: 'Board Meeting', 
      img: '/meeting.jpg',
      bgPos: 'center 10%'
    },
  ];

  const [activeScenario, setActiveScenario] = useState(scenarios[0]);

  // Distance is 100% clear. This calculates the width of the near reading corridor at the bottom.
  const getCorridorWidths = (tier: 'Basic' | 'Elite' | 'Individual') => {
    let baseNear = 100;
    let nearPenalty = 1;

    if (tier === 'Basic') {
      baseNear = 40;
      nearPenalty = 14;
    } else if (tier === 'Elite') {
      baseNear = 65;
      nearPenalty = 9;
    } else if (tier === 'Individual') {
      baseNear = 90;
      nearPenalty = 4;
    }

    // The higher the addition (above +1.00), the narrower the near corridor becomes
    const addFactor = Math.max(0, readingAdd - 1.0); 
    
    return {
      nearWidth: Math.max(15, baseNear - (addFactor * nearPenalty))
    };
  };

  const tiers: ('Basic' | 'Elite' | 'Individual')[] = ['Basic', 'Elite', 'Individual'];

  return (
    <div className="mt-6 p-6 bg-slate-800 rounded-xl text-white shadow-inner">
      <h3 className="text-lg font-bold mb-2">Live Varifocal Visualiser</h3>
      <p className="text-sm text-slate-300 mb-5">
        Distance vision remains wide open. See how higher reading additions naturally narrow the reading area, and how premium lenses counter this by actively widening the near corridor.
      </p>

      {/* Scenario Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenario(scenario)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeScenario.id === scenario.id 
                ? 'bg-[#3f9185] text-white shadow' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {scenario.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const { nearWidth } = getCorridorWidths(tier);

          return (
            <div key={tier} className="flex flex-col items-center">
              <h4 className="font-semibold text-[#3f9185] bg-white px-3 py-1 rounded-full text-sm mb-3 shadow">
                {tier} Design
              </h4>
              
              {/* Simulated Lens Area */}
              <div 
                className="relative w-full h-64 bg-slate-200 rounded-t-[40%] rounded-b-[40%] overflow-hidden border-4 border-slate-600 shadow-lg"
                style={{ 
                  backgroundImage: `url('${activeScenario.img}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: activeScenario.bgPos,
                  backgroundRepeat: 'no-repeat'
                }}
              >
                
                {/* Left Blur Panel (Curved edge, wide open at top) */}
                <div 
                  className="absolute bottom-0 left-0 bg-white/30 backdrop-blur-md transition-all duration-500 ease-in-out z-10 border-t-2 border-r-2 border-white/50"
                  style={{ 
                    height: '60%',
                    width: `calc(50% - ${nearWidth/2}%)`,
                    borderTopRightRadius: '100% 100%'
                  }}
                />

                {/* Right Blur Panel (Curved edge, wide open at top) */}
                <div 
                  className="absolute bottom-0 right-0 bg-white/30 backdrop-blur-md transition-all duration-500 ease-in-out z-10 border-t-2 border-l-2 border-white/50"
                  style={{ 
                    height: '60%',
                    width: `calc(50% - ${nearWidth/2}%)`,
                    borderTopLeftRadius: '100% 100%'
                  }}
                />

              </div>
              
              <div className="text-xs text-slate-400 mt-3 flex justify-between w-full px-4 font-medium">
                <span>Dist: Wide Open</span>
                <span>Near: {nearWidth.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  // --- State ---
  const [customerName, setCustomerName] = useState<string>('');
  const [isOwnFrame, setIsOwnFrame] = useState<boolean>(false);
  const [framePrice, setFramePrice] = useState<number>(0);
  const [lensType, setLensType] = useState<LensType>('Single Vision');
  const [lensIndex, setLensIndex] = useState<LensIndex>('1.5');
  const [coating, setCoating] = useState<Coating>('None');
  const [lightProtection, setLightProtection] = useState<LightProtection>('None');
  
  // Demo State
  const [showDemo, setShowDemo] = useState<boolean>(false);
  const [readingAdd, setReadingAdd] = useState<number>(2.00);

  // --- Calculations ---
  const lensBaseCost = useMemo(() => getLensBasePrice(lensType, lensIndex, isOwnFrame), [lensType, lensIndex, isOwnFrame]);
  const coatingCost = useMemo(() => getCoatingPrice(coating), [coating]);
  const protectionCost = useMemo(() => getLightProtectionPrice(lightProtection, lensType), [lightProtection, lensType]);
  
  const activeFramePrice = isOwnFrame ? 0 : (framePrice || 0);
  const totalCost = activeFramePrice + lensBaseCost + coatingCost + protectionCost;

  const isVarifocalSelected = lensType.includes('Varifocal');

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Header with Logo */}
        <div className="bg-white py-6 px-8 flex justify-center border-b-4 border-[#3f9185]">
          <img 
            src="https://img1.wsimg.com/isteam/ip/297dd456-b70f-4175-b7e6-7f1aabf6e6b3/blob-0f9c396.png/:/rs=w:315,h:63,cg:true,m/cr=w:315,h:63/qt=q:95" 
            alt="Brand Logo" 
            className="h-14 object-contain"
          />
        </div>

        {/* Top Form Content */}
        <div className="p-8 space-y-8">
          
          {/* Top Row: Name and Frame Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="e.g. Jane Doe" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3f9185] focus:border-[#3f9185] outline-none bg-gray-50 transition-colors"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Frame Source</label>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => setIsOwnFrame(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isOwnFrame ? 'bg-[#3f9185] shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  New Frame
                </button>
                <button
                  type="button"
                  onClick={() => setIsOwnFrame(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isOwnFrame ? 'bg-[#3f9185] shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Own Frame
                </button>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className={`block text-sm font-semibold mb-2 ${isOwnFrame ? 'text-gray-400' : 'text-gray-700'}`}>
                Frame Price (£)
              </label>
              <input 
                type="number" 
                value={framePrice || ''} 
                onChange={(e) => setFramePrice(parseFloat(e.target.value))} 
                placeholder="0.00" 
                disabled={isOwnFrame}
                className={`w-full p-3 border rounded-lg transition-colors outline-none ${isOwnFrame ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-[#3f9185] focus:border-[#3f9185] bg-gray-50'}`}
              />
            </div>
          </div>

          {/* Interactive Table Section */}
          <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
            <table className="w-full border-collapse bg-white">
              <tbody>
                
                {/* Lens Type */}
                <tr>
                  <th className="p-3 border-b border-r border-gray-300 bg-gray-50 text-left w-1/5 text-sm font-semibold text-gray-800">
                    Lens Type
                  </th>
                  <TableCell isSelected={lensType === 'Single Vision'} onClick={() => { setLensType('Single Vision'); setShowDemo(false); }}>Single Vision</TableCell>
                  <TableCell isSelected={lensType === 'Basic Varifocal'} onClick={() => setLensType('Basic Varifocal')}>Basic Varifocal</TableCell>
                  <TableCell isSelected={lensType === 'Elite Varifocal'} onClick={() => setLensType('Elite Varifocal')}>Elite Varifocal</TableCell>
                  <TableCell isSelected={lensType === 'Individual Varifocal'} onClick={() => setLensType('Individual Varifocal')}>Individual Varifocal</TableCell>
                </tr>

                {/* Lens Index */}
                <tr>
                  <th className="p-3 border-b border-r border-gray-300 bg-gray-50 text-left w-1/5 text-sm font-semibold text-gray-800">
                    Thickness (Index)
                  </th>
                  <TableCell isSelected={lensIndex === '1.5'} onClick={() => setLensIndex('1.5')}>1.5<br/><span className="text-xs font-normal opacity-80">Standard</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.6'} onClick={() => setLensIndex('1.6')}>1.6<br/><span className="text-xs font-normal opacity-80">Thin</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.67'} onClick={() => setLensIndex('1.67')}>1.67<br/><span className="text-xs font-normal opacity-80">Extra Thin</span></TableCell>
                  <TableCell isSelected={lensIndex === '1.74'} onClick={() => setLensIndex('1.74')}>1.74<br/><span className="text-xs font-normal opacity-80">Super Thin</span></TableCell>
                </tr>

                {/* Coatings */}
                <tr>
                  <th className="p-3 border-b border-r border-gray-300 bg-gray-50 text-left w-1/5 text-sm font-semibold text-gray-800">
                    Coatings
                  </th>
                  <TableCell isSelected={coating === 'None'} onClick={() => setCoating('None')} colSpan={2}>Standard Uncoated</TableCell>
                  <TableCell isSelected={coating === 'MAR'} onClick={() => setCoating('MAR')}>MAR<br/><span className="text-xs font-normal opacity-80">+£25</span></TableCell>
                  <TableCell isSelected={coating === 'Blue Filter'} onClick={() => setCoating('Blue Filter')}>Blue Filter<br/><span className="text-xs font-normal opacity-80">+£45</span></TableCell>
                </tr>

                {/* Light Protection */}
                <tr>
                  <th className="p-3 border-r border-gray-300 bg-gray-50 text-left w-1/5 text-sm font-semibold text-gray-800">
                    Light Protection
                  </th>
                  <TableCell isSelected={lightProtection === 'None'} onClick={() => setLightProtection('None')}>Clear Lens</TableCell>
                  <TableCell isSelected={lightProtection === 'Transitions'} onClick={() => setLightProtection('Transitions')}>Transitions<br/><span className="text-xs font-normal opacity-80">{lensType === 'Single Vision' ? '+£45' : '+£69'}</span></TableCell>
                  <TableCell isSelected={lightProtection === 'XtrActive Transitions'} onClick={() => setLightProtection('XtrActive Transitions')}>XtrActive<br/><span className="text-xs font-normal opacity-80">+£65</span></TableCell>
                  <TableCell isSelected={lightProtection === 'Solid Tint'} onClick={() => setLightProtection('Solid Tint')}>Solid Tint<br/><span className="text-xs font-normal opacity-80">+£25</span></TableCell>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Varifocal Demo Toggle & Section */}
          {isVarifocalSelected && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-gray-800">Varifocal Field Visualiser</h3>
                  <p className="text-sm text-gray-600">Demonstrate distance and near zones based on real-world scenarios.</p>
                </div>
                <button
                  onClick={() => setShowDemo(!showDemo)}
                  className="px-6 py-2 bg-[#3f9185] text-white font-semibold rounded-lg shadow hover:bg-[#2c6b62] transition-colors whitespace-nowrap"
                >
                  {showDemo ? 'Hide Visualiser' : 'Show Visualiser'}
                </button>
              </div>

              {showDemo && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient's Reading Addition: <span className="text-[#3f9185] text-lg">+{readingAdd.toFixed(2)}</span>
                  </label>
                  <input 
                    type="range" 
                    min="1.00" 
                    max="3.50" 
                    step="0.25" 
                    value={readingAdd} 
                    onChange={(e) => setReadingAdd(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#3f9185]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>+1.00</span>
                    <span>+2.00</span>
                    <span>+3.00</span>
                    <span>+3.50</span>
                  </div>

                  <VarifocalDemo readingAdd={readingAdd} />
                </div>
              )}
            </div>
          )}

          {/* Coating Benefits Comparison Table */}
          <div className="mt-8">
            <h3 className="text-md font-bold text-gray-800 mb-3">Coating Benefits Comparison</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 border-b border-r border-gray-300 text-left font-semibold text-gray-800 w-1/4">Feature</th>
                    <th className="p-3 border-b border-r border-gray-300 text-center font-semibold text-gray-800 w-1/4">Standard Uncoated</th>
                    <th className="p-3 border-b border-r border-gray-300 text-center font-semibold text-gray-800 w-1/4">MAR (+£25)</th>
                    <th className="p-3 border-b border-gray-300 text-center font-semibold text-gray-800 w-1/4">Blue Filter (+£45)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-r border-gray-300 text-left text-gray-700 font-medium">Scratch Resistant</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                    <td className="p-3 border-b border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-r border-gray-300 text-left text-gray-700 font-medium">Few Reflections</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-gray-300 font-bold">-</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                    <td className="p-3 border-b border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-r border-gray-300 text-left text-gray-700 font-medium">Easy Clean</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-gray-300 font-bold">-</td>
                    <td className="p-3 border-b border-r border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                    <td className="p-3 border-b border-gray-300 text-center text-[#3f9185] font-bold text-lg">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-r border-gray-300 text-left text-gray-700 font-medium">Filters Blue Light</td>
                    <td className="p-3 border-r border-gray-300 text-center text-gray-300 font-bold">-</td>
                    <td className="p-3 border-r border-gray-300 text-center text-gray-300 font-bold">-</td>
                    <td className="p-3 text-center text-[#3f9185] font-bold text-lg">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 border-t border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex justify-between items-end">
            <span>Quote Summary {customerName && <span className="text-gray-500 font-medium">for {customerName}</span>}</span>
            <span className="text-xs font-semibold px-2 py-1 bg-[#3f9185]/10 text-[#3f9185] rounded-full">
              {isOwnFrame ? 'Reglaze (Own Frame)' : 'New Frame'}
            </span>
          </h2>
          
          <div className="space-y-2 text-gray-700">
            {!isOwnFrame && (
              <div className="flex justify-between">
                <span>Frame:</span>
                <span className="font-semibold">£{activeFramePrice}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Lens Base ({lensType} - {lensIndex}):</span>
              <span className="font-semibold">£{lensBaseCost}</span>
            </div>
            {coatingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Coating ({coating}):</span>
                <span>£{coatingCost}</span>
              </div>
            )}
            {protectionCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Protection ({lightProtection}):</span>
                <span>£{protectionCost}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Price:</span>
            <span className="text-3xl font-extrabold text-[#3f9185]">£{totalCost.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}