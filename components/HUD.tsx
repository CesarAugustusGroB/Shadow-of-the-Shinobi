
import React from 'react';
import { GameState } from '../types';
import { HEART_ASSET, FIREBALL_COOLDOWN, FIREBALL_COST, LIGHTNING_BLADE_COOLDOWN, LIGHTNING_BLADE_COST, COLORS } from '../constants';

interface HUDProps {
  gameState: GameState;
  onConsultSpirits: () => void;
  onRestart: () => void;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({ gameState, onConsultSpirits, onRestart, isPaused }) => {
  const currentXp = gameState.player.xp || 0;
  const maxXp = gameState.player.maxXp || 1;
  const xpPercentage = (currentXp / maxXp) * 100;

  const currentChakra = gameState.player.chakra || 0;
  const maxChakra = gameState.player.maxChakra || 100;
  const chakraPercentage = Math.min(100, Math.max(0, (currentChakra / maxChakra) * 100));
  
  // Calculate cooldown percentage for overlay (0% height means ready)
  const fireballCooldownPct = Math.min(100, (gameState.fireballCooldown / FIREBALL_COOLDOWN) * 100);
  const hasChakraForFireball = currentChakra >= FIREBALL_COST;

  const lightningCooldownPct = Math.min(100, (gameState.lightningBladeCooldown / LIGHTNING_BLADE_COOLDOWN) * 100);
  const hasChakraForLightning = currentChakra >= LIGHTNING_BLADE_COST;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Top Left: Health & Chakra & Ammo */}
        <div className="flex flex-col gap-2">
          {/* Health */}
          <div className="flex gap-1">
            {Array.from({ length: gameState.player.maxHealth }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center transform transition-transform ${
                  i < gameState.player.health ? 'scale-100' : 'scale-90 opacity-30 grayscale'
                }`}
              >
                <img 
                  src={HEART_ASSET} 
                  alt="Heart" 
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
            ))}
          </div>

          {/* Chakra Bar */}
          <div className="w-32 h-2 bg-slate-900 border border-slate-700 rounded-full overflow-hidden relative shadow-md">
             <div 
                className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] transition-all duration-300 ease-out"
                style={{ width: `${chakraPercentage}%` }}
             />
          </div>
          
          {/* Shuriken Counter */}
          <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur px-3 py-1 rounded border border-slate-700 w-fit">
            <div className="w-4 h-4 bg-blue-400 rotate-45"></div> {/* Shuriken Icon Placeholder */}
            <span className="text-blue-100 font-bold font-mono text-xl">{gameState.shurikens}</span>
          </div>
        </div>

        {/* Top Right: Gold/Score & Floor */}
        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-2 bg-stone-800/80 backdrop-blur px-4 py-1 rounded-lg border border-stone-600">
             <span className="text-stone-400 font-mono text-xs uppercase tracking-widest">Floor</span>
             <span className="text-white font-serif font-bold text-xl">{gameState.wave}</span>
           </div>
           <div className="flex items-center gap-2 bg-yellow-900/30 backdrop-blur px-4 py-2 rounded-lg border border-yellow-700/50">
             <span className="text-yellow-400 font-serif font-bold text-2xl tracking-widest">{gameState.score}</span>
             <span className="text-yellow-600 text-sm uppercase">Gold</span>
           </div>
        </div>
      </div>

      {/* Center Messages */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 z-20">
          <div className="text-center animate-bounce">
            <h1 className="text-6xl font-bold text-red-600 mb-4 font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">YOU DIED</h1>
            <p className="text-neutral-400 mb-6">The shadows have claimed you.</p>
            <button 
              onClick={onRestart}
              className="px-8 py-3 bg-red-800 hover:bg-red-700 text-white font-bold rounded shadow-lg border border-red-500 transition-all"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* PAUSE */}
      {!gameState.isGameOver && isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 z-20 backdrop-blur-[2px]">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4 font-serif tracking-[0.2em] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">PAUSED</h1>
            <p className="text-neutral-300 font-mono text-sm animate-pulse">PRESS 'P' TO RESUME</p>
          </div>
        </div>
      )}

      {/* Bottom Area */}
      <div className="flex flex-col gap-2 w-full">
        
        {/* Experience Bar */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center mb-2">
             <div className="w-full flex justify-between text-xs text-cyan-400 font-mono mb-1 px-1">
                 <span>LVL {gameState.player.level}</span>
                 <span>XP {Math.floor(currentXp)} / {maxXp}</span>
             </div>
             <div className="w-full h-3 bg-slate-900 border border-slate-700 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                 <div 
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-300 ease-out"
                    style={{ width: `${xpPercentage}%` }}
                 />
                 <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
             </div>
        </div>

        {/* Controls & Tools */}
        <div className="flex justify-between items-end">
            <div className="flex gap-4">
                {/* Attack Icon */}
                <div className="group relative">
                    <div className="w-12 h-12 bg-neutral-800 border-2 border-neutral-600 rounded flex items-center justify-center group-active:border-red-500">
                        <span className="text-2xl">⚔️</span>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-400 bg-black px-1">SPACE</span>
                </div>
                {/* Lightning Blade (New Skill Q) */}
                <div className="group relative">
                    <div className={`w-12 h-12 bg-neutral-800 border-2 rounded flex items-center justify-center overflow-hidden relative transition-all ${
                        hasChakraForLightning ? 'border-cyan-600' : 'border-neutral-800 opacity-50 grayscale'
                    }`}>
                         <span className="text-xl">⚡</span>
                         {/* Cooldown Overlay */}
                         <div 
                            className="absolute bottom-0 left-0 right-0 bg-black/70 transition-all duration-100"
                            style={{ height: `${lightningCooldownPct}%` }}
                         ></div>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-400 bg-black px-1">Q</span>
                </div>
                {/* Fireball Jutsu Icon */}
                <div className="group relative">
                    <div className={`w-12 h-12 bg-neutral-800 border-2 rounded flex items-center justify-center overflow-hidden relative transition-all ${
                        hasChakraForFireball ? 'border-orange-600' : 'border-neutral-800 opacity-50 grayscale'
                    }`}>
                         <span className="text-xl">🔥</span>
                         <div 
                            className="absolute bottom-0 left-0 right-0 bg-black/70 transition-all duration-100"
                            style={{ height: `${fireballCooldownPct}%` }}
                         ></div>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-400 bg-black px-1">E</span>
                </div>
                {/* Shuriken Icon */}
                <div className="group relative">
                    <div className={`w-12 h-12 bg-neutral-800 border-2 rounded flex items-center justify-center transition-colors ${gameState.shurikens > 0 ? 'border-neutral-600 group-active:border-blue-500' : 'border-red-900 opacity-50'}`}>
                        <span className="text-xl">💠</span>
                    </div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-neutral-400 bg-black px-1">L-CLICK</span>
                </div>
            </div>

            {/* Spirit Guide Button */}
            <button 
                onClick={onConsultSpirits}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600 rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
                <span className="animate-pulse">✨</span>
                <span className="font-serif tracking-wider">Consult Spirits</span>
            </button>
        </div>
      </div>
    </div>
  );
};
