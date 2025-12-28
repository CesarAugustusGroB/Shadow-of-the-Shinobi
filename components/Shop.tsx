import React from 'react';
import { GameState } from '../types';
import { SHOP_PRICES, HEART_ASSET } from '../constants';

interface ShopProps {
  playerState: GameState;
  onUpdateState: (newState: GameState) => void;
  onClose: () => void;
}

export const Shop: React.FC<ShopProps> = ({ playerState, onUpdateState, onClose }) => {
  const { player, score, shurikens } = playerState;

  const buy = (cost: number, effect: (p: typeof playerState) => void) => {
    if (score >= cost) {
      const newState = { ...playerState, score: score - cost };
      effect(newState);
      onUpdateState(newState);
    }
  };

  const ShopItem = ({ 
    name, 
    price, 
    icon, 
    description, 
    action, 
    disabled 
  }: { 
    name: string, 
    price: number, 
    icon: React.ReactNode, 
    description: string, 
    action: () => void,
    disabled?: boolean
  }) => (
    <button 
      onClick={action}
      disabled={score < price || disabled}
      className={`group relative p-4 border-2 rounded flex flex-col items-center gap-2 transition-all duration-200 
        ${score >= price && !disabled
          ? 'bg-stone-900 border-stone-600 hover:border-yellow-500 hover:bg-stone-800' 
          : 'bg-stone-950 border-stone-900 opacity-50 cursor-not-allowed'
        }`}
    >
      <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-stone-300 font-serif font-bold text-center leading-tight">{name}</div>
      <div className="text-xs text-stone-500 text-center">{description}</div>
      <div className={`mt-2 font-mono font-bold ${score >= price ? 'text-yellow-500' : 'text-red-900'}`}>
        {price} G
      </div>
    </button>
  );

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="w-full max-w-4xl p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center border-b border-stone-800 pb-6">
          <h2 className="text-4xl font-serif text-yellow-600 mb-2 tracking-widest">THE WANDERING MERCHANT</h2>
          <p className="text-stone-500 italic">"Everything has a price, Ronin. Even survival."</p>
        </div>

        {/* Status Bar */}
        <div className="flex justify-center gap-12 text-lg font-mono mb-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <span>GOLD:</span>
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <span>HP:</span>
            <span className="text-2xl font-bold">{player.health}/{player.maxHealth}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <span>AMMO:</span>
            <span className="text-2xl font-bold">{shurikens}</span>
          </div>
        </div>

        {/* Shop Grid */}
        <div className="grid grid-cols-3 gap-4">
          <ShopItem 
            name="Rice Ball"
            price={SHOP_PRICES.HEAL}
            icon="🍙"
            description="Restores 1 Health Point."
            disabled={player.health >= player.maxHealth}
            action={() => buy(SHOP_PRICES.HEAL, (s) => {
              s.player.health = Math.min(s.player.maxHealth, s.player.health + 1);
            })}
          />
          
          <ShopItem 
            name="Spirit Heart"
            price={SHOP_PRICES.MAX_HEALTH}
            icon={<img src={HEART_ASSET} className="w-8 h-8" alt="heart" />}
            description="Max Health +1 & Full Heal."
            action={() => buy(SHOP_PRICES.MAX_HEALTH, (s) => {
              s.player.maxHealth += 1;
              s.player.health = s.player.maxHealth;
            })}
          />

          <ShopItem 
            name="Shuriken Bundle"
            price={SHOP_PRICES.SHURIKENS}
            icon="💠"
            description="+5 Shurikens."
            action={() => buy(SHOP_PRICES.SHURIKENS, (s) => {
              s.shurikens += 5;
            })}
          />

          <ShopItem 
            name="Meditation Incense"
            price={SHOP_PRICES.REFILL_CHAKRA}
            icon="🧘"
            description="Refill Chakra completely."
            disabled={player.chakra !== undefined && player.chakra >= (player.maxChakra || 100)}
            action={() => buy(SHOP_PRICES.REFILL_CHAKRA, (s) => {
              if (s.player.maxChakra) s.player.chakra = s.player.maxChakra;
            })}
          />

          <ShopItem 
            name="Ancient Scroll"
            price={SHOP_PRICES.MAX_CHAKRA}
            icon="📜"
            description="Max Chakra +20 & Refill."
            action={() => buy(SHOP_PRICES.MAX_CHAKRA, (s) => {
              if (s.player.maxChakra) s.player.maxChakra += 20;
              s.player.chakra = s.player.maxChakra;
            })}
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-700 rounded transition-colors font-serif text-xl tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            LEAVE & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};
