
import React, { useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { ScenarioType } from '../types';

interface MainMenuProps {
  onStart: (scenario: ScenarioType) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('KYOTO');

  return (
    <div 
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      className="relative z-50 flex flex-col items-center justify-between bg-stone-950 text-white p-12 border-4 border-stone-800 shadow-2xl rounded overflow-hidden select-none font-sans"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex flex-col items-center mt-4">
        <div className="flex flex-col items-center leading-none mb-6">
            <h1 className="text-8xl font-black font-serif text-red-700 tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
            SHADOW
            </h1>
            <div className="flex items-center gap-4 w-full">
                <div className="h-[2px] bg-stone-700 flex-grow"></div>
                <h2 className="text-2xl font-serif text-stone-400 tracking-[0.5em] uppercase">of the Shinobi</h2>
                <div className="h-[2px] bg-stone-700 flex-grow"></div>
            </div>
        </div>
        <p className="text-stone-500 font-mono text-sm max-w-md text-center italic">
          "The corruption spreads. Choose your battleground."
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="relative z-10 flex gap-6 w-full max-w-2xl justify-center">
        {/* Card: Wilderness */}
        <button
            onClick={() => setSelectedScenario('WILDERNESS')}
            className={`flex-1 relative group p-6 border-2 rounded-lg transition-all duration-300 overflow-hidden text-left ${
                selectedScenario === 'WILDERNESS' 
                ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] translate-y-[-4px]' 
                : 'bg-stone-900/40 border-stone-800 hover:border-stone-600 hover:bg-stone-900/60'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
                <div className={`text-4xl mb-3 transition-transform duration-300 ${selectedScenario === 'WILDERNESS' ? 'scale-110' : 'scale-100 grayscale group-hover:grayscale-0'}`}>🌲</div>
                <h3 className={`text-xl font-serif font-bold tracking-widest mb-1 ${selectedScenario === 'WILDERNESS' ? 'text-emerald-400' : 'text-stone-400'}`}>WILDERNESS</h3>
                <div className="h-[1px] w-12 bg-current mb-3 opacity-30"></div>
                <p className="text-xs text-stone-500 font-mono leading-relaxed">
                    Open fields and ancient rocks. Maneuverability is high, but cover is scarce.
                </p>
            </div>
            {selectedScenario === 'WILDERNESS' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
            )}
        </button>

        {/* Card: Kyoto */}
        <button
            onClick={() => setSelectedScenario('KYOTO')}
            className={`flex-1 relative group p-6 border-2 rounded-lg transition-all duration-300 overflow-hidden text-left ${
                selectedScenario === 'KYOTO' 
                ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)] translate-y-[-4px]' 
                : 'bg-stone-900/40 border-stone-800 hover:border-stone-600 hover:bg-stone-900/60'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
                <div className={`text-4xl mb-3 transition-transform duration-300 ${selectedScenario === 'KYOTO' ? 'scale-110' : 'scale-100 grayscale group-hover:grayscale-0'}`}>⛩️</div>
                <h3 className={`text-xl font-serif font-bold tracking-widest mb-1 ${selectedScenario === 'KYOTO' ? 'text-red-400' : 'text-stone-400'}`}>OLD KYOTO</h3>
                <div className="h-[1px] w-12 bg-current mb-3 opacity-30"></div>
                <p className="text-xs text-stone-500 font-mono leading-relaxed">
                    Tight alleys and buildings. Close quarters combat. Ambush opportunities.
                </p>
            </div>
            {selectedScenario === 'KYOTO' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
            )}
        </button>
      </div>

      {/* Start Button */}
      <div className="relative z-10 w-full flex justify-center mb-4">
        <button 
          onClick={() => onStart(selectedScenario)}
          className="group relative px-20 py-5 bg-black overflow-hidden rounded transition-all hover:scale-105 border border-stone-700 hover:border-red-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           
           <span className="relative z-10 font-serif text-2xl tracking-[0.3em] font-bold text-stone-300 group-hover:text-white transition-colors flex items-center gap-6">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500">⚔️</span> 
              ENTER THE SHADOWS 
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500">⚔️</span>
           </span>
           
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-500 to-transparent opacity-50 group-hover:via-red-500 transition-colors"></div>
           <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-stone-500 to-transparent opacity-50 group-hover:via-red-500 transition-colors"></div>
        </button>
      </div>

      {/* Controls Footer */}
      <div className="relative z-10 w-full border-t border-stone-800 pt-6">
        <div className="flex justify-center gap-8 text-[10px] font-mono text-stone-600 uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">WASD</span>
                <span>MOVE</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">SPACE</span>
                <span>ATTACK</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">Q</span>
                <span>LIGHTNING</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">E</span>
                <span>FIREBALL</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">L-CLICK</span>
                <span>THROW</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700">SHIFT</span>
                <span>DASH</span>
            </div>
        </div>
      </div>
    </div>
  );
};
