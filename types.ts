
export type ScenarioType = 'WILDERNESS' | 'KYOTO';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  VAMPIRE = 'VAMPIRE',
  OBSTACLE = 'OBSTACLE',
  PROJECTILE = 'PROJECTILE',
  ENEMY_PROJECTILE = 'ENEMY_PROJECTILE',
  FIREBALL = 'FIREBALL',
  FIRE_ZONE = 'FIRE_ZONE',
  PICKUP = 'PICKUP',
  EFFECT = 'EFFECT'
}

export interface UpgradeCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'HEALTH' | 'CHAKRA' | 'SHURIKEN' | 'SPEED' | 'DASH' | 'FIREBALL' | 'HEAL';
}

export interface GameObject {
  id: string;
  type: EntityType;
  pos: Vector2;
  size: Size;
  color: string;
  velocity: Vector2;
  health: number;
  maxHealth: number;
  isDead: boolean;
  chakra?: number;
  maxChakra?: number;
  sprite?: string; 
  rotation?: number;
  path?: Vector2[];
  pathTimer?: number;
  attackTimer?: number;
  swingTimer?: number; 
  deathTimer?: number; 
  lungeTimer?: number; 
  lungeCooldown?: number; 
  weight?: number; 
  invulnerableTimer?: number;
  level?: number;
  xp?: number;
  maxXp?: number;
  value?: number; 
  startPos?: Vector2;
  // Stats modifiers for roguelite progression
  speedMult?: number;
  dashCooldownMod?: number;
  fireballCooldownMod?: number;
}

export interface Particle extends GameObject {
  lifeTime: number;
  maxLifeTime: number;
}

export interface FireZone extends GameObject {
  lifeTime: number;
  maxLifeTime: number;
  tickTimer: number;
}

export interface GameState {
  player: GameObject;
  enemies: GameObject[];
  obstacles: GameObject[];
  projectiles: GameObject[];
  particles: Particle[];
  pickups: GameObject[];
  fireZones: FireZone[];
  score: number; // Gold
  shurikens: number;
  wave: number;
  isGameOver: boolean;
  isPaused: boolean;
  fireballCooldown: number;
  lightningBladeCooldown: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  shoot: boolean;
  dash: boolean;
  special: boolean; 
  skill1: boolean; // Lightning Blade (Q)
  mousePos: Vector2;
}
