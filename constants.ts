
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SPEED = 200; // pixels per second
export const PLAYER_DASH_SPEED = 600;
export const DASH_DURATION = 0.2;
export const DASH_COOLDOWN = 3.0;

// Lightning Blade Skill
export const LIGHTNING_BLADE_SPEED = 1200;
export const LIGHTNING_BLADE_DURATION = 0.15;
export const LIGHTNING_BLADE_COOLDOWN = 6.0;
export const LIGHTNING_BLADE_COST = 40;
export const LIGHTNING_BLADE_DAMAGE = 5;

export const ENEMY_SPEED = 80;
export const VAMPIRE_SPEED = 130; // Faster than guards
export const PROJECTILE_SPEED = 400;

// Fireball Jutsu (Special E)
export const FIREBALL_SPEED = 350;
export const FIREBALL_RANGE = 200; // Increased range
export const FIREBALL_COOLDOWN = 4.0;
export const FIREBALL_COST = 50; // Chakra Cost (50% of initial pool)
export const EXPLOSION_RADIUS = 60;
export const FIREBALL_DAMAGE = 2; // Reduced initial damage (since we have burn DOT now)
export const FIRE_ZONE_DURATION = 3.0;
export const FIRE_ZONE_TICK_RATE = 0.5; // Damage every 0.5s
export const FIRE_ZONE_DAMAGE = 1;

// AI Behaviors
export const ENEMY_SEPARATION_DIST = 40;
export const ENEMY_LUNGE_RANGE = 80;
export const ENEMY_LUNGE_SPEED = 250;
export const ENEMY_LUNGE_DURATION = 0.4;
export const ENEMY_LUNGE_COOLDOWN = 3.0;
export const VAMPIRE_PREFERRED_DIST = 250; // Vampires try to stay this far away

// Vampire Abilities
export const VAMPIRE_ATTACK_COOLDOWN = 2.5;
export const ENEMY_PROJECTILE_SPEED = 250;

export const PLAYER_SIZE = { w: 32, h: 32 };
export const ENEMY_SIZE = { w: 32, h: 32 };
export const XP_ORB_SIZE = { w: 10, h: 10 };
export const TILE_SIZE = 32;

export const DEATH_DURATION = 0.8; // Seconds for enemy death animation

// Physics Weights
export const UNIT_WEIGHTS = {
  PLAYER: 20, // Ninja
  SAMURAI: 30, // Enemy Guard (Heaviest)
  VAMPIRE: 10 // Vampire (Lightest)
};

// Colors (Placeholders for sprites)
export const COLORS = {
  PLAYER: '#3b82f6', // Blue-500
  PLAYER_ATTACK: '#ef4444', // Red-500 (swing trail)
  ENEMY: '#991b1b', // Red-800 (Samurai Armor)
  VAMPIRE: '#4c1d95', // Violet-900
  ENEMY_AGGRO: '#dc2626', // Red-600
  OBSTACLE: '#3f3f46', // Zinc-700
  PROJECTILE: '#94a3b8', // Slate-400
  ENEMY_PROJECTILE: '#be123c', // Rose-700 (Blood Orb)
  FIREBALL: '#f97316', // Orange-500
  EXPLOSION: '#fbbf24', // Amber-400
  FIRE_ZONE_CORE: '#7c2d12', // Orange-900
  FIRE_ZONE_EDGE: '#ea580c', // Orange-600
  GOLD: '#eab308', // Yellow-500
  GROUND: '#171717', // Neutral-900
  XP_ORB: '#22d3ee', // Cyan-400
  XP_ORB_GLOW: '#06b6d4', // Cyan-500
  CHAKRA_BAR: '#8b5cf6', // Violet-500
  CHAKRA_BG: '#4c1d95', // Violet-900
  LIGHTNING: '#06b6d4', // Cyan-500
  LIGHTNING_WHITE: '#ffffff',
  // New Kyoto Colors
  LANTERN_PAPER: '#fca5a5', // Red-200
  LANTERN_GLOW: '#ef4444', // Red-500
  WOOD_DARK: '#451a03', // Amber-950
  WOOD_LIGHT: '#78350f', // Amber-900
  FENCE_WOOD: '#573018', // Dark Wood
  TREE_TRUNK: '#2a1a11', // Very Dark Wood
  TREE_SAKURA: '#fbcfe8', // Pink-200
  TREE_SAKURA_DARK: '#ec4899', // Pink-500
  TREE_GREEN_LIGHT: '#4ade80', // Green-400
  TREE_GREEN_DARK: '#15803d', // Green-700
};

export const INITIAL_HEALTH = 3;
export const INITIAL_CHAKRA = 100;
export const CHAKRA_REGEN = 5; // Per second
export const INITIAL_SHURIKENS = 10;
export const INITIAL_LEVEL = 1;
export const INITIAL_XP = 0;
export const INITIAL_MAX_XP = 50;

export const XP_VALUES = {
  ENEMY: 10,
  VAMPIRE: 30
};

export const SHOP_PRICES = {
  HEAL: 50,
  MAX_HEALTH: 250,
  SHURIKENS: 40,
  REFILL_CHAKRA: 30,
  MAX_CHAKRA: 150
};

// Spirit Guide System Prompts
export const SPIRIT_SYSTEM_INSTRUCTION = `You are an ancient spirit guide in a dark fantasy Japanese world. 
The player is a Ninja fighting corrupted Samurai Guards and ancient Vampires. 
Speak in riddles, haikus, or cryptic wisdom. 
Provide tactical advice based on the player's low health or lack of ammo if necessary, but keep the tone serious and atmospheric.`;

// Assets

// HUD Heart Asset (SVG)
export const HEART_ASSET = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" stroke="%23ffffff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

// Enemy (Samurai Guard)
// Detailed Kabuto helmet, red shoulder armor, dark mask
export const ENEMY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M4 14 Q16 10 28 14 L26 26 L6 26 Z" fill="%237f1d1d"/><rect x="11" y="14" width="10" height="14" fill="%23171717"/><path d="M11 14 H21 V26 H11 Z" fill="none" stroke="%23b91c1c" stroke-width="1"/><path d="M8 8 L24 8 L26 14 L6 14 Z" fill="%23171717"/><path d="M16 8 L12 2 L14 8 M16 8 L20 2 L18 8" stroke="%23fbbf24" stroke-width="2" fill="none"/><path d="M10 14 H22 L20 20 H12 Z" fill="%23262626"/><circle cx="14" cy="16" r="1.5" fill="%23ef4444"/><circle cx="18" cy="16" r="1.5" fill="%23ef4444"/></svg>`;

// Enemy (Vampire)
// Pale face, high collar, flowing purple cape
export const VAMPIRE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M2 12 Q16 6 30 12 L30 30 L2 30 Z" fill="%232e1065"/><rect x="12" y="14" width="8" height="16" fill="%230f172a"/><path d="M12 14 L16 22 L20 14" fill="%23e2e8f0"/><circle cx="16" cy="10" r="5" fill="%23f1f5f9"/><path d="M11 9 Q16 4 21 9 L21 7 Q16 1 11 7 Z" fill="%230f172a"/><circle cx="14" cy="10" r="1" fill="%23ef4444"/><circle cx="18" cy="10" r="1" fill="%23ef4444"/><path d="M9 12 L11 16 L5 16 Z" fill="%23be123c"/><path d="M23 12 L21 16 L27 16 Z" fill="%23be123c"/></svg>`;

// Player (Ninja) Directional SVGs
const NINJA_BASE_COLOR = "%230f172a"; // Slate-900
const NINJA_SKIN_COLOR = "%23fca5a5"; // Red-200
const NINJA_HEADBAND_COLOR = "%231e40af"; // Blue-800
const NINJA_ACCENT_COLOR = "%233b82f6"; // Blue-500

export const NINJA_SVG_DOWN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="20" rx="2" fill="${NINJA_BASE_COLOR}" /><rect x="10" y="10" width="12" height="6" fill="${NINJA_SKIN_COLOR}" /><rect x="8" y="6" width="16" height="4" fill="${NINJA_HEADBAND_COLOR}" /><circle cx="13" cy="13" r="1.5" fill="black"/><circle cx="19" cy="13" r="1.5" fill="black"/><rect x="6" y="9" width="20" height="2" fill="${NINJA_ACCENT_COLOR}" /></svg>`;

export const NINJA_SVG_UP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="20" rx="2" fill="${NINJA_BASE_COLOR}" /><rect x="8" y="6" width="16" height="6" fill="${NINJA_HEADBAND_COLOR}" /><rect x="14" y="10" width="4" height="16" fill="%23334155" /><rect x="13" y="4" width="6" height="6" fill="%2394a3b8" /><rect x="6" y="9" width="20" height="2" fill="${NINJA_ACCENT_COLOR}" /></svg>`;

export const NINJA_SVG_RIGHT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="10" y="8" width="12" height="20" rx="2" fill="${NINJA_BASE_COLOR}" /><rect x="18" y="10" width="4" height="6" fill="${NINJA_SKIN_COLOR}" /><rect x="10" y="6" width="14" height="4" fill="${NINJA_HEADBAND_COLOR}" /><circle cx="20" cy="13" r="1.5" fill="black"/><rect x="8" y="9" width="16" height="2" fill="${NINJA_ACCENT_COLOR}" /></svg>`;

export const NINJA_SVG_LEFT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="10" y="8" width="12" height="20" rx="2" fill="${NINJA_BASE_COLOR}" /><rect x="10" y="10" width="4" height="6" fill="${NINJA_SKIN_COLOR}" /><rect x="8" y="6" width="14" height="4" fill="${NINJA_HEADBAND_COLOR}" /><circle cx="12" cy="13" r="1.5" fill="black"/><rect x="8" y="9" width="16" height="2" fill="${NINJA_ACCENT_COLOR}" /></svg>`;

// Sword (Horizontal, handle left)
export const KATANA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="0" y="14" width="8" height="4" fill="black" rx="1" /><rect x="8" y="13" width="2" height="6" fill="%23d4af37" /><path d="M10 14 L30 14 L28 18 L10 18 Z" fill="%23cbd5e1" /><path d="M10 14 L30 14 L29 16 L10 16 Z" fill="%23f8fafc" opacity="0.6" /></svg>`;
