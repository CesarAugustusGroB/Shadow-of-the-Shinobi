
import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { SpiritGuide } from './components/SpiritGuide';
import { Shop } from './components/Shop';
import { LevelUp } from './components/LevelUp';
import { MainMenu } from './components/MainMenu';
import { GameState, EntityType, ScenarioType, UpgradeCard } from './types';
import { consultSpiritGuide } from './services/geminiService';
import { INITIAL_HEALTH, INITIAL_SHURIKENS, COLORS, PLAYER_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_CHAKRA } from './constants';

const App: React.FC = () => {
  const [hudState, setHudState] = useState<GameState>({
    player: { 
        id: 'p1', type: EntityType.PLAYER, pos: {x:0,y:0}, size: PLAYER_SIZE, 
        color: COLORS.PLAYER, velocity: {x:0,y:0}, health: INITIAL_HEALTH, maxHealth: INITIAL_HEALTH, isDead: false,
        chakra: INITIAL_CHAKRA, maxChakra: INITIAL_CHAKRA, level: 1, xp: 0, maxXp: 50,
        speedMult: 1, dashCooldownMod: 0, fireballCooldownMod: 0
    },
    enemies: [], obstacles: [], projectiles: [], particles: [], pickups: [], fireZones: [],
    score: 0, shurikens: INITIAL_SHURIKENS, wave: 1, isGameOver: false, isPaused: false,
    fireballCooldown: 0, lightningBladeCooldown: 0
  });

  const [inMenu, setInMenu] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('KYOTO');
  const [showSpiritGuide, setShowSpiritGuide] = useState(false);
  const [spiritMessage, setSpiritMessage] = useState("");
  const [isLoadingSpirit, setIsLoadingSpirit] = useState(false);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [pendingLevelState, setPendingLevelState] = useState<Partial<GameState> | undefined>(undefined);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' && !inMenu && !hudState.isGameOver && !showSpiritGuide && !showShop && !showLevelUp) {
        setIsManualPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hudState.isGameOver, showSpiritGuide, showShop, showLevelUp, inMenu]);

  const handleConsultSpirits = async () => {
    setShowSpiritGuide(true);
    setIsLoadingSpirit(true);
    const advice = await consultSpiritGuide({ health: hudState.player.health, shurikens: hudState.shurikens, score: hudState.score, enemiesCount: hudState.enemies.length, wave: hudState.wave });
    setSpiritMessage(advice);
    setIsLoadingSpirit(false);
  };

  const handleRestart = () => {
    setGameKey(prev => prev + 1);
    setIsManualPaused(false); setShowShop(false); setShowLevelUp(false);
    setPendingLevelState(undefined);
    setHudState({
      player: { 
          id: 'p1', type: EntityType.PLAYER, pos: {x:0,y:0}, size: PLAYER_SIZE, 
          color: COLORS.PLAYER, velocity: {x:0,y:0}, health: INITIAL_HEALTH, maxHealth: INITIAL_HEALTH, isDead: false,
          chakra: INITIAL_CHAKRA, maxChakra: INITIAL_CHAKRA, level: 1, xp: 0, maxXp: 50,
          speedMult: 1, dashCooldownMod: 0, fireballCooldownMod: 0
      },
      enemies: [], obstacles: [], projectiles: [], particles: [], pickups: [], fireZones: [], score: 0, shurikens: INITIAL_SHURIKENS, wave: 1, isGameOver: false, isPaused: false, fireballCooldown: 0, lightningBladeCooldown: 0
    });
    setSpiritMessage(""); setShowSpiritGuide(false);
  };

  const handleLevelComplete = (finalState: GameState) => {
    setHudState(finalState); setPendingLevelState(finalState); setShowShop(true);
  };

  const handleLevelUp = (finalState: GameState) => {
    setHudState(finalState); setPendingLevelState(finalState); setShowLevelUp(true);
  };

  const handleUpgradeSelect = (upgrade: UpgradeCard) => {
    if (!pendingLevelState) return;
    const newState = { ...pendingLevelState } as GameState;
    const p = newState.player;
    switch(upgrade.type) {
      case 'HEALTH': p.maxHealth++; p.health = p.maxHealth; break;
      case 'CHAKRA': p.maxChakra! += 25; p.chakra = p.maxChakra; break;
      case 'SHURIKEN': newState.shurikens += 15; break;
      case 'SPEED': p.speedMult! += 0.15; break;
      case 'DASH': p.dashCooldownMod! -= 0.5; break;
      case 'FIREBALL': p.fireballCooldownMod! -= 0.5; break;
      case 'HEAL': p.health = p.maxHealth; p.chakra = p.maxChakra; break;
    }
    setHudState(newState); setPendingLevelState(newState); setShowLevelUp(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-sans">
      <div className="relative shadow-2xl bg-black rounded" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        {inMenu ? (
          <MainMenu onStart={(s) => { setSelectedScenario(s); setInMenu(false); handleRestart(); }} />
        ) : (
          <>
            <GameCanvas key={gameKey} scenario={selectedScenario} setGameStateRef={setHudState} isPaused={showSpiritGuide || isManualPaused || showShop || showLevelUp} initialState={pendingLevelState} onLevelComplete={handleLevelComplete} onLevelUp={handleLevelUp} />
            <HUD gameState={hudState} onConsultSpirits={handleConsultSpirits} onRestart={handleRestart} isPaused={isManualPaused} />
            <SpiritGuide isOpen={showSpiritGuide} isLoading={isLoadingSpirit} message={spiritMessage} onClose={() => { setShowSpiritGuide(false); setSpiritMessage(""); }} />
            {showShop && pendingLevelState && <Shop playerState={pendingLevelState as GameState} onUpdateState={(s) => { setHudState(s); setPendingLevelState(s); }} onClose={() => { setShowShop(false); setGameKey(k => k + 1); }} />}
            {showLevelUp && <LevelUp onSelect={handleUpgradeSelect} />}
          </>
        )}
      </div>
      {!inMenu && <div className="mt-4 text-stone-500 text-sm font-mono text-center"><p>WASD to Move • SPACE to Attack • Q for Lightning Blade • E for Fireball Jutsu • L-CLICK to Shoot • P to Pause</p></div>}
    </div>
  );
};

export default App;
