import { useState, useMemo } from 'react';

// --- Types ---
type LensType = 'Single Vision' | 'Basic Varifocal' | 'Elite Varifocal' | 'Individual Varifocal';
type LensIndex = '1.5' | '1.6' | '1.67' | '1.74';
type Coating = 'None' | 'MAR' | 'Blue Filter';
type LightProtection = 'None' | 'Transitions' | 'XtrActive Transitions' | 'Solid Tint';

// --- Pricing Logic ---
const getLensBasePrice = (type: LensType, index: LensIndex): number => {
  if (type === 'Single Vision') {
    const prices = { '1.5': 0, '1.6': 35, '1.67': 100, '1.74': 149 };
    return prices[index];
  }
  if (type === 'Basic Varifocal') {
    const prices = { '1.5': 119, '1.6': 184, '1.67': 214, '1.74': 264 };
    return prices[index];
  }
  if (type === 'Elite Varifocal') {
    const prices = { '1.5': 139, '1.6': 234, '1.67': 264, '1.74': 314 };
    return prices[index];
  }
  if (type === 'Individual Varifocal') {
    const prices = { '1.5': 199, '1.6': 294, '1.67': 314, '1.74': 374 };
    return prices[index];
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
  const [framePrice, setFramePrice] = useState<number>(0);
  const [lensType, setLensType] = useState<LensType>('Single Vision');
  const [lensIndex, setLensIndex] = useState<LensIndex>('1.5');
  const [coating, setCoating] = useState<Coating>('None');
  const [lightProtection, setLightProtection] = useState<LightProtection>('None');

  // --- Calculations ---
  const lensBaseCost = useMemo(() => getLensBasePrice(lensType, lensIndex), [lensType, lensIndex]);
  const coatingCost = useMemo(() => getCoatingPrice(coating), [coating]);
  const protectionCost = useMemo(() => getLightProtectionPrice(lightProtection, lensType), [lightProtection, lensType]);
  
  const totalCost = (framePrice || 0) + lensBaseCost + coatingCost + protectionCost;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 py-6 px-8">
          <h1 className="text-2xl font-bold text-white text-center">Optician Price Calculator</h1>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Name */}
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

            {/* Frame Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Frame Price (£)</label>
              <input 
                type="number" 
                value={framePrice || ''} 
                onChange={(e) => setFramePrice(parseFloat(e.target.value))} 
                placeholder="0.00" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-gray-50 transition-colors"
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
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Quote Summary {customerName && <span className="text-slate-600 font-medium">for {customerName}</span>}
          </h2>
          
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Frame:</span>
              <span className="font-semibold">£{framePrice || 0}</span>
            </div>
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