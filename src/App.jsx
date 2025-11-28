import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, Menu, RefreshCw, List, Image as ImageIcon, Check } from 'lucide-react';

/**
 * COLOR PALETTE
 * Extracted from the user's reference image to match the earthy/retro vibe.
 */
const WHEEL_COLORS = [
  '#4bb6e0ff', // Dark Forest Green
  '#A09D37', // Olive
  '#F4AF1B', // Orange
  '#FAF0A6', // Pale Yellow
  '#E6C229', // Mustard
];

/**
 * UTILS
 */
// Helper to calculate the SVG path for a circle slice
const getCoordinatesForPercent = (percent) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

const WheelComponent = ({ segments, onSpinComplete, isSpinning, setIsSpinning, winningIndex }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const spinWheel = () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    
    // Minimum 5 spins (1800 deg) + random segment offset
    const minSpins = 5;
    const newRotation = rotation + (360 * minSpins) + Math.floor(Math.random() * 360);
    
    setRotation(newRotation);

    // Calculate winner based on the final angle
    // The pointer is at the TOP (270 degrees or -90 degrees in standard circle math)
    // We need to normalize the rotation to find where the top lands.
    setTimeout(() => {
      setIsSpinning(false);
      
      const normalizedRotation = newRotation % 360;
      const pointerAngle = 0; // 12 o'clock position (adjusted)
      
      // Calculate which segment is at the pointer angle
      // We essentially reverse the rotation to see what's at 270
      const effectiveAngle = (pointerAngle - normalizedRotation + 360) % 360;
      
      const segmentAngle = 360 / segments.length;
      const winningIndex = Math.floor(effectiveAngle / segmentAngle);
      
      // Report both label and index so the parent can highlight the winning spot
      onSpinComplete(segments[winningIndex], winningIndex);
    }, 4000); // Matches CSS transition duration
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* THE WHEEL */}
      <div 
        className="w-full h-full rounded-full overflow-hidden shadow-2xl relative"
        style={{
          transition: 'transform 4s cubic-bezier(0.1, 0.05, 0.01, 1.0)', // Slow down ease-out
          transform: `rotate(${rotation}deg)`
        }}
      >
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full pointer-events-none">
          {segments.map((segment, index) => {
            // Logic to draw SVG slices
            const startAngle = index * (1 / segments.length);
            const endAngle = (index + 1) * (1 / segments.length);
            
            const [startX, startY] = getCoordinatesForPercent(startAngle);
            const [endX, endY] = getCoordinatesForPercent(endAngle);
            
            const largeArcFlag = 1 / segments.length > 0.5 ? 1 : 0;
            
            const pathData = [
              `M 0 0`,
              `L ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return (
              <g key={index}>
                <path 
                  d={pathData} 
                  fill={WHEEL_COLORS[index % WHEEL_COLORS.length]} 
                  stroke={index === winningIndex ? '#065f46' : 'none'}
                  strokeWidth={index === winningIndex ? 0.02 : 0}
                  style={{ transition: 'stroke-width 300ms, filter 300ms', filter: index === winningIndex ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))' : 'none' }}
                />
                {/* Text Label */}
                <text
                  x={0.6} // Distance from center
                  y={0}
                  fill={['#FAF0A6', '#E6C229'].includes(WHEEL_COLORS[index % WHEEL_COLORS.length]) ? '#2E4B1B' : 'white'}
                  fontSize="0.12"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${(startAngle + endAngle) / 2 * 360})`}
                >
                  {segment.length > 12 ? segment.substring(0, 10) + '..' : segment}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* CENTER SPIN BUTTON (TEARDROP SHAPE) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <button
          onClick={spinWheel}
          disabled={isSpinning || segments.length < 2}
          className={`
            relative group flex items-center justify-center
            transition-transform duration-200 active:scale-95
            ${isSpinning ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-105'}
          `}
        >
          {/* Teardrop Shape using CSS borders/rotation or SVG */}
          {/* We use an SVG to perfectly match the "location pin" style in the image */}
          <svg width="80" height="96" viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
             {/* The Pin Body */}
             <path 
               d="M40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0Z" 
               fill="#1F2937" 
             />
             {/* The Point pointing UP */}
             <path 
               d="M40 0L25 25H55L40 0Z" 
               fill="#1F2937" 
             />
          </svg>
          
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-black text-sm tracking-widest">
            SPIN
          </span>
        </button>
      </div>

      {/* Pointer Shadow / Depth indicator (visible pointer at top) */}
      <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 text-gray-800 z-30 pointer-events-none">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-gray-900" />
      </div>
    </div>
  );
};

export default function App() {
  const [segments, setSegments] = useState([  ]);
  const [inputValue, setInputValue] = useState("");
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const addSegment = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSegments([...segments, inputValue.trim()]);
    setInputValue("");
  };

  const removeSegment = (indexToRemove) => {
    if (isSpinning) return;
    setSegments(segments.filter((_, index) => index !== indexToRemove));

    // If the removed segment was the winner, clear it. If removed index is before the winner,
    // shift the stored winner index down by one so it still points to the same logical item.
    setWinner(prev => {
      if (!prev) return prev;
      if (prev.index === indexToRemove) return null;
      if (prev.index > indexToRemove) return { ...prev, index: prev.index - 1 };
      return prev;
    });
  };

  const shuffleSegments = () => {
    if (isSpinning) return;
    setSegments([...segments].sort(() => Math.random() - 0.5));
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* LEFT COLUMN: WHEEL */}
        <div className="order-2 lg:order-1 flex flex-col items-center justify-center py-8">
           <WheelComponent 
             segments={segments} 
             onSpinComplete={(label, idx) => setWinner({ label, index: idx })} 
             isSpinning={isSpinning}
             setIsSpinning={setIsSpinning}
             winningIndex={winner?.index ?? null}
           />
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="order-1 lg:order-2 w-full max-w-md mx-auto h-full max-h-[600px] flex flex-col">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">INPUTS</h2>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white flex-1 overflow-y-auto flex flex-col gap-4">
              
              <form onSubmit={addSegment} className="flex gap-0 shadow-sm rounded-md overflow-hidden ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-gray-400">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Input text here..."
                  className="flex-1 px-4 py-3 bg-gray-100 outline-none text-gray-700 placeholder-gray-500"
                  disabled={isSpinning}
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isSpinning}
                  className="bg-gray-200 px-4 text-gray-600 hover:bg-gray-300 transition-colors flex items-center justify-center border-l border-white"
                >
                  <Plus size={24} />
                </button>
              </form>

              <div className="border-t border-dashed border-gray-300 my-2"></div>

              {/* List of Choices */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
                {segments.map((segment, index) => (
                  <div key={index} className={`group flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all ${winner?.index === index ? 'border-2 border-green-400' : 'border border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                       <div 
                         className={`w-4 h-4 rounded-full ${winner?.index === index ? 'ring-2 ring-green-300' : ''}`} 
                         style={{ backgroundColor: WHEEL_COLORS[index % WHEEL_COLORS.length] }}
                       ></div>
                       <span className={`font-medium ${winner?.index === index ? 'text-green-700' : 'text-gray-700'}`}>{segment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {winner?.index === index && (
                        <div className="text-green-500 flex items-center gap-1 text-sm font-bold">
                          <Check size={16} />
                          <span>Winner</span>
                        </div>
                      )}
                      <button 
                        onClick={() => removeSegment(index)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-red-50"
                        title="Remove"
                        disabled={isSpinning}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {segments.length === 0 && (
                  <div className="text-center text-gray-400 py-8 italic">
                    Add some choices to the wheel!
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* WINNER MODAL */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
             {/* Confetti-ish background decoration */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500"></div>
             
             <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">We have a winner!</h3>
             <div className="text-4xl font-black text-gray-800 mb-6 break-words leading-tight">
               {winner?.label}
             </div>
             
             <button 
               onClick={() => setWinner(null)}
               className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors w-full flex items-center justify-center gap-2"
             >
               <Check size={20} />
               Continue
             </button>
          </div>
        </div>
      )}

      {/* Footer / Mobile Hint */}
      <div className="mt-8 text-gray-400 text-xs text-center">
        {segments.length < 2 ? "Add at least 2 options to spin" : "Tap SPIN to start"}
      </div>
    </div>
  );
}