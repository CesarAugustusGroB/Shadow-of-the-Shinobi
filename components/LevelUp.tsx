import React, { useMemo } from 'react';
import { UpgradeCard } from '../types';

interface LevelUpProps {
  onSelect: (upgrade: UpgradeCard) => void;
}

const UPGRADES: UpgradeCard[] = [
  { id: 'hp', name: 'Life Essence', description: 'Increase Max Health by 1 and heal fully.', icon: '❤️', type: 'HEALTH' },
  { id: 'chakra', name: 'Spiritual Flow', description: 'Increase Max Chakra by 25.', icon: '⚛️', type: 'CHAKRA' },
  { id: 'shuriken', name: 'Bottomless Bag', description: 'Instantly gain 15 Shurikens.', icon: '💠', type: 'SHURIKEN' },
  { id: 'speed', name: 'Swift Step', description: 'Movement speed increased by 15%.', icon: '💨', type: 'SPEED' },
  { id: 'dash', name: 'Flowing Wind', description: 'Dash cooldown reduced by 0.5s.', icon: '🌀', type: 'DASH' },
  { id: 'fire', name: 'Inner Flame', description: 'Fireball Jutsu cooldown reduced by 0.5s.', icon: '🔥', type: 'FIREBALL' },
  { id: 'heal', name: 'Meditation', description: 'Fully restore health and chakra.', icon: '🧘', type: 'HEAL' },
];

export const LevelUp: React.FC<LevelUpProps> = ({ onSelect }) => {
  // Randomly select 3 unique upgrades from the pool
  const selection = useMemo(() => {
    const shuffled = [...UPGRADES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-8">
      <div className="w-full max-w-5xl flex flex-col items-center">
        <h2 className="text-5xl font-serif text-cyan-400 mb-2 tracking-[0.2em] drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] uppercase">
          Transcension
        </h2>
        <p className="text-stone-500 italic mb-12 font-serif text-xl">
          "The spirit evolves. Choose your path."
        </p>

        <div className="grid grid-cols-3 gap-8 w-full">
          {selection.map((upgrade) => (
            <button
              key={upgrade.id}
              onClick={() => onSelect(upgrade)}
              className="group relative flex flex-col items-center p-8 bg-stone-900 border-2 border-stone-800 rounded-lg transition-all duration-300 hover:border-cyan-500 hover:bg-stone-800 hover:-translate-y-4 shadow-2xl overflow-hidden"
            >
              {/* Card Aura */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="text-7xl mb-6 group-hover:scale-125 transition-transform duration-500">
                {upgrade.icon}
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-stone-100 mb-4 tracking-widest uppercase text-center">
                {upgrade.name}
              </h3>
              
              <div className="h-[1px] w-16 bg-cyan-900 mb-4 group-hover:w-32 transition-all duration-500" />
              
              <p className="text-stone-400 text-center text-sm leading-relaxed mb-8">
                {upgrade.description}
              </p>
              
              <div className="mt-auto px-6 py-2 border border-cyan-800 bg-cyan-950/20 text-cyan-400 text-[10px] tracking-[0.4em] uppercase rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                Select Blessing
              </div>

              {/* Decorative corner lines */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-stone-700 group-hover:border-cyan-500 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-stone-700 group-hover:border-cyan-500 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-stone-700 group-hover:border-cyan-500 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-stone-700 group-hover:border-cyan-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};