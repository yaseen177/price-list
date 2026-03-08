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

export default function App() {
  // --- State ---
  const [customerName, setCustomerName] = useState<string>('');
  const [isOwnFrame, setIsOwnFrame] = useState<boolean>(false);
  const [framePrice, setFramePrice] = useState<number>(0);
  const [lensType, setLensType] = useState<LensType>('Single Vision');
  const [lensIndex, setLensIndex] = useState<LensIndex>('1.5');
  const [coating, setCoating] = useState<Coating>('None');
  const [lightProtection, setLightProtection] = useState<LightProtection>('None');

  // --- Calculations ---
  const lensBaseCost = useMemo(() => getLensBasePrice(lensType, lensIndex, isOwnFrame), [lensType, lensIndex, isOwnFrame]);
  const coatingCost = useMemo(() => getCoatingPrice(coating), [coating]);
  const protectionCost = useMemo(() => getLightProtectionPrice(lightProtection, lensType), [lightProtection, lensType]);
  
  // If it's their own frame, we ignore the frame price entirely.
  const activeFramePrice = isOwnFrame ? 0 : (framePrice || 0);
  const totalCost = activeFramePrice + lensBaseCost + coatingCost + protectionCost;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 py-6 px-8">
          <h1 className="text-2xl font-bold text-white text-center">Optician Price Calculator</h1>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          
          {/* Top Row: Name and Frame Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="e.g. Jane Doe" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-gray-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Frame Source</label>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => setIsOwnFrame(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isOwnFrame ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  New Frame
                </button>
                <button
                  type="button"
                  onClick={() => setIsOwnFrame(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isOwnFrame ? 'bg-white shadow text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Own Frame (Reglaze)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Frame Price */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isOwnFrame ? 'text-gray-400' : 'text-gray-700'}`}>
                Frame Price (£)
              </label>
              <input 
                type="number" 
                value={framePrice || ''} 
                onChange={(e) => setFramePrice(parseFloat(e.target.value))} 
                placeholder="0.00" 
                disabled={isOwnFrame}
                className={`w-full p-3 border rounded-lg transition-colors ${isOwnFrame ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-gray-50'}`}
              />
            </div>

            {/* Lens Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lens Type</label>
              <select 
                value={lensType} 
                onChange={(e) => setLensType(e.target.value as LensType)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white cursor-pointer"
              >
                <option value="Single Vision">Single Vision</option>
                <option value="Basic Varifocal">Varifocal - Basic</option>
                <option value="Elite Varifocal">Varifocal - Elite</option>
                <option value="Individual Varifocal">Varifocal - Individual</option>
              </select>
            </div>

            {/* Lens Index */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lens Index (Thickness)</label>
              <select 
                value={lensIndex} 
                onChange={(e) => setLensIndex(e.target.value as LensIndex)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white cursor-pointer"
              >
                <option value="1.5">1.5 - Standard</option>
                <option value="1.6">1.6 - Thin</option>
                <option value="1.67">1.67 - Extra Thin</option>
                <option value="1.74">1.74 - Super Thin</option>
              </select>
            </div>

            {/* Coatings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coatings</label>
              <select 
                value={coating} 
                onChange={(e) => setCoating(e.target.value as Coating)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white cursor-pointer"
              >
                <option value="None">Standard Uncoated (£0)</option>
                <option value="MAR">MAR (+£25)</option>
                <option value="Blue Filter">Blue Filter (+£45)</option>
              </select>
            </div>

            {/* Light Protection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Light Protection</label>
              <select 
                value={lightProtection} 
                onChange={(e) => setLightProtection(e.target.value as LightProtection)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white cursor-pointer"
              >
                <option value="None">Clear Lens (£0)</option>
                <option value="Transitions">Transitions</option>
                <option value="XtrActive Transitions">XtrActive Transitions (+£65)</option>
                <option value="Solid Tint">Solid Tint (+£25)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-slate-50 border-t border-gray-200 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2 flex justify-between items-end">
            <span>Quote Summary {customerName && <span className="text-slate-600 font-medium">for {customerName}</span>}</span>
            <span className="text-xs font-normal px-2 py-1 bg-slate-200 text-slate-700 rounded-full">
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
              <div className="flex justify-between text-slate-600">
                <span>Coating ({coating}):</span>
                <span>£{coatingCost}</span>
              </div>
            )}
            {protectionCost > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Protection ({lightProtection}):</span>
                <span>£{protectionCost}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total Price:</span>
            <span className="text-3xl font-extrabold text-emerald-600">£{totalCost.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}