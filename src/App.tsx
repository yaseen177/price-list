import React, { useState, useMemo } from 'react';

// --- Types ---
type LensType = 'Single Vision' | 'Basic Varifocal' | 'Elite Varifocal' | 'Individual Varifocal';
type LensIndex = '1.5' | '1.6' | '1.67' | '1.74';
type Coating = 'None' | 'MAR' | 'Blue Filter';
type LightProtection = 'None' | 'Transitions' | 'XtrActive Transitions' | 'Solid Tint';

// --- Pricing Logic based on your provided image ---
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
  // Using SV prices as standard, with the £69 Varifocal Transition exception from your list
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

  // --- Basic Styling ---
  const containerStyle: React.CSSProperties = { maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
  const sectionStyle: React.CSSProperties = { marginBottom: '20px' };
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { ...inputStyle, backgroundColor: '#fff' };
  const summaryStyle: React.CSSProperties = { backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginTop: '30px' };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#111827' }}>Optician Price Calculator</h1>
      
      <div style={sectionStyle}>
        <label style={labelStyle}>Customer Name</label>
        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Jane Doe" style={inputStyle} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Frame Price (£)</label>
        <input type="number" value={framePrice || ''} onChange={(e) => setFramePrice(parseFloat(e.target.value))} placeholder="0.00" style={inputStyle} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Lens Type (Varifocals)</label>
        <select value={lensType} onChange={(e) => setLensType(e.target.value as LensType)} style={selectStyle}>
          <option value="Single Vision">Single Vision</option>
          <option value="Basic Varifocal">Varifocal - Basic</option>
          <option value="Elite Varifocal">Varifocal - Elite</option>
          <option value="Individual Varifocal">Varifocal - Individual</option>
        </select>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Lens Index (Thickness)</label>
        <select value={lensIndex} onChange={(e) => setLensIndex(e.target.value as LensIndex)} style={selectStyle}>
          <option value="1.5">1.5 - Standard</option>
          <option value="1.6">1.6 - Thin</option>
          <option value="1.67">1.67 - Extra Thin</option>
          <option value="1.74">1.74 - Super Thin</option>
        </select>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Coatings</label>
        <select value={coating} onChange={(e) => setCoating(e.target.value as Coating)} style={selectStyle}>
          <option value="None">Standard Uncoated (£0)</option>
          <option value="MAR">MAR (+£25)</option>
          <option value="Blue Filter">Blue Filter (+£45)</option>
        </select>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Light Protection</label>
        <select value={lightProtection} onChange={(e) => setLightProtection(e.target.value as LightProtection)} style={selectStyle}>
          <option value="None">Clear Lens (£0)</option>
          <option value="Transitions">Transitions</option>
          <option value="XtrActive Transitions">XtrActive Transitions (+£65)</option>
          <option value="Solid Tint">Solid Tint (+£25)</option>
        </select>
      </div>

      <div style={summaryStyle}>
        <h2 style={{ marginTop: 0, borderBottom: '1px solid #d1d5db', paddingBottom: '10px' }}>
          Quote Summary {customerName && `for ${customerName}`}
        </h2>
        <p><strong>Frame:</strong> £{framePrice || 0}</p>
        <p><strong>Lens Base ({lensType} - {lensIndex}):</strong> £{lensBaseCost}</p>
        {coatingCost > 0 && <p><strong>Coating ({coating}):</strong> £{coatingCost}</p>}
        {protectionCost > 0 && <p><strong>Protection ({lightProtection}):</strong> £{protectionCost}</p>}
        
        <h3 style={{ fontSize: '1.5rem', color: '#047857', marginTop: '20px' }}>
          Total Price: £{totalCost.toFixed(2)}
        </h3>
      </div>
    </div>
  );
}