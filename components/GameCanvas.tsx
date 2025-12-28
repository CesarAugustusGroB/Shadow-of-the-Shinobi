
import React, { useRef, useEffect } from 'react';
import { 
  GameState, 
  GameObject, 
  EntityType, 
  Vector2,
  InputState,
  ScenarioType
} from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SPEED,
  PLAYER_DASH_SPEED,
  DASH_DURATION,
  DASH_COOLDOWN,
  PLAYER_SIZE,
  COLORS,
  INITIAL_HEALTH,
  INITIAL_CHAKRA,
  CHAKRA_REGEN,
  INITIAL_SHURIKENS,
  INITIAL_LEVEL,
  INITIAL_XP,
  INITIAL_MAX_XP,
  XP_VALUES,
  XP_ORB_SIZE,
  ENEMY_SPEED,
  VAMPIRE_SPEED,
  ENEMY_SIZE,
  PROJECTILE_SPEED,
  VAMPIRE_ATTACK_COOLDOWN,
  ENEMY_PROJECTILE_SPEED,
  DEATH_DURATION,
  ENEMY_SEPARATION_DIST,
  ENEMY_LUNGE_RANGE,
  ENEMY_LUNGE_SPEED,
  ENEMY_LUNGE_DURATION,
  ENEMY_LUNGE_COOLDOWN,
  VAMPIRE_PREFERRED_DIST,
  UNIT_WEIGHTS,
  FIREBALL_SPEED,
  FIREBALL_RANGE,
  FIREBALL_COOLDOWN,
  FIREBALL_COST,
  EXPLOSION_RADIUS,
  FIREBALL_DAMAGE,
  FIRE_ZONE_DURATION,
  FIRE_ZONE_TICK_RATE,
  FIRE_ZONE_DAMAGE,
  LIGHTNING_BLADE_SPEED,
  LIGHTNING_BLADE_DURATION,
  LIGHTNING_BLADE_COOLDOWN,
  LIGHTNING_BLADE_COST,
  LIGHTNING_BLADE_DAMAGE,
  NINJA_SVG_DOWN,
  NINJA_SVG_UP,
  NINJA_SVG_LEFT,
  NINJA_SVG_RIGHT,
  ENEMY_SVG,
  VAMPIRE_SVG,
  KATANA_SVG
} from '../constants';

const GRID_CELL_SIZE = 40;
const GRID_COLS = Math.ceil(CANVAS_WIDTH / GRID_CELL_SIZE);
const GRID_ROWS = Math.ceil(CANVAS_HEIGHT / GRID_CELL_SIZE);

interface GridNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: GridNode | null;
}

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  sway: number;
  swayOffset: number;
}

const getGridPos = (pos: Vector2) => ({
  x: Math.floor((pos.x + 16) / GRID_CELL_SIZE),
  y: Math.floor((pos.y + 16) / GRID_CELL_SIZE)
});

const findPath = (startPos: Vector2, endPos: Vector2, grid: boolean[][]): Vector2[] => {
  const startNode = getGridPos(startPos);
  const endNode = getGridPos(endPos);
  if (startNode.x < 0 || startNode.x >= GRID_COLS || startNode.y < 0 || startNode.y >= GRID_ROWS) return [];
  if (endNode.x < 0 || endNode.x >= GRID_COLS || endNode.y < 0 || endNode.y >= GRID_ROWS) return [];
  if (!grid[endNode.y][endNode.x]) return []; 
  const openList: GridNode[] = [];
  const closedList = new Set<string>();
  openList.push({ x: startNode.x, y: startNode.y, f: 0, g: 0, h: 0, parent: null });
  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift()!;
    const currentKey = `${currentNode.x},${currentNode.y}`;
    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      const path: Vector2[] = [];
      let curr: GridNode | null = currentNode;
      while (curr) {
        path.push({
          x: curr.x * GRID_CELL_SIZE + GRID_CELL_SIZE / 2 - 16,
          y: curr.y * GRID_CELL_SIZE + GRID_CELL_SIZE / 2 - 16
        });
        curr = curr.parent;
      }
      return path.reverse();
    }
    closedList.add(currentKey);
    const neighbors = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    for (const neighbor of neighbors) {
      const nx = currentNode.x + neighbor.x;
      const ny = currentNode.y + neighbor.y;
      if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) continue;
      if (!grid[ny][nx]) continue; 
      if (closedList.has(`${nx},${ny}`)) continue;
      const gScore = currentNode.g + 1;
      const hScore = Math.abs(nx - endNode.x) + Math.abs(ny - endNode.y); 
      const fScore = gScore + hScore;
      const existingNode = openList.find(n => n.x === nx && n.y === ny);
      if (existingNode) {
        if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.f = fScore;
          existingNode.parent = currentNode;
        }
      } else {
        openList.push({ x: nx, y: ny, g: gScore, h: hScore, f: fScore, parent: currentNode });
      }
    }
  }
  return [];
};

const checkCollision = (a: GameObject, b: GameObject): boolean => {
  return (
    a.pos.x < b.pos.x + b.size.w &&
    a.pos.x + a.size.w > b.pos.x &&
    a.pos.y < b.pos.y + b.size.h &&
    a.pos.y + a.size.h > b.pos.y
  );
};

const checkRectCollision = (r1: {x:number, y:number, w:number, h:number}, r2: {x:number, y:number, w:number, h:number}) => {
    return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
};

const hasLineOfSight = (start: Vector2, end: Vector2, obstacles: GameObject[]): boolean => {
  const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const steps = Math.ceil(dist / 20); 
  const dx = (end.x - start.x) / steps;
  const dy = (end.y - start.y) / steps;
  for (let i = 1; i < steps; i++) {
    const px = start.x + dx * i;
    const py = start.y + dy * i;
    const pointRect = { x: px - 2, y: py - 2, w: 4, h: 4 };
    for (const obs of obstacles) {
       if (checkRectCollision(pointRect, { x: obs.pos.x, y: obs.pos.y, w: obs.size.w, h: obs.size.h })) return false;
    }
  }
  return true;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

interface GameCanvasProps {
  scenario: ScenarioType;
  setGameStateRef: (gameState: GameState) => void;
  isPaused: boolean;
  initialState?: Partial<GameState>;
  onLevelComplete: (finalState: GameState) => void;
  onLevelUp: (finalState: GameState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
    scenario, 
    setGameStateRef, 
    isPaused, 
    initialState,
    onLevelComplete,
    onLevelUp
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<{ [key: string]: HTMLImageElement | HTMLCanvasElement | null }>({});
  const facingRef = useRef<'up' | 'down' | 'left' | 'right'>('down');
  const gridRef = useRef<boolean[][]>([]);
  const roomTransitionRef = useRef(false);
  const transitionTimerRef = useRef(0);
  const ambientParticlesRef = useRef<AmbientParticle[]>([]);

  const stateRef = useRef<GameState>({
    player: {
      id: 'player', type: EntityType.PLAYER, pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      size: PLAYER_SIZE, color: COLORS.PLAYER, velocity: { x: 0, y: 0 }, health: INITIAL_HEALTH, maxHealth: INITIAL_HEALTH,
      isDead: false, chakra: INITIAL_CHAKRA, maxChakra: INITIAL_CHAKRA, invulnerableTimer: 0,
      level: INITIAL_LEVEL, xp: INITIAL_XP, maxXp: INITIAL_MAX_XP, weight: UNIT_WEIGHTS.PLAYER,
      speedMult: 1, dashCooldownMod: 0, fireballCooldownMod: 0
    },
    enemies: [], obstacles: [], projectiles: [], particles: [], pickups: [], fireZones: [], score: 0, shurikens: INITIAL_SHURIKENS,
    wave: 1, isGameOver: false, isPaused: false, fireballCooldown: 0, lightningBladeCooldown: 0
  });

  const inputRef = useRef<InputState>({ 
    up: false, down: false, left: false, right: false, attack: false, shoot: false, dash: false, special: false, skill1: false, mousePos: { x: 0, y: 0 } 
  });
  const lastTimeRef = useRef<number>(0);
  const attackCooldownRef = useRef<number>(0);
  const shootCooldownRef = useRef<number>(0);
  const fireballCooldownRef = useRef<number>(0);
  const dashCooldownRef = useRef<number>(0);
  const dashTimeRef = useRef<number>(0);
  const dashVelocityRef = useRef<Vector2>({x:0, y:0});

  // Lightning Blade State
  const lightningBladeCooldownRef = useRef<number>(0);
  const lightningBladeTimeRef = useRef<number>(0);
  const lightningBladeVelocityRef = useRef<Vector2>({x:0, y:0});
  const lightningTrailRef = useRef<Vector2[]>([]);

  useEffect(() => {
    ambientParticlesRef.current = [];
    const particleCount = scenario === 'KYOTO' ? 150 : 50;
    for (let i = 0; i < particleCount; i++) {
        ambientParticlesRef.current.push({ x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT, vx: -30 - Math.random() * 50, vy: 20 + Math.random() * 30, size: 2 + Math.random() * 3, opacity: 0.5 + Math.random() * 0.5, sway: Math.random() * Math.PI * 2, swayOffset: Math.random() * 0.05 });
    }
    
    // Pattern Generation
    const grassCanvas = document.createElement('canvas'); grassCanvas.width = 64; grassCanvas.height = 64;
    const gCtx = grassCanvas.getContext('2d'); if (gCtx) { gCtx.fillStyle = '#14532d'; gCtx.fillRect(0,0,64,64); for(let i=0; i<100; i++) { gCtx.fillStyle = Math.random() > 0.5 ? '#166534' : '#052e16'; gCtx.fillRect(Math.random()*64, Math.random()*64, 2, 2); } }
    spritesRef.current.floorPatternGrass = grassCanvas;
    
    const cobbleCanvas = document.createElement('canvas'); cobbleCanvas.width = 64; cobbleCanvas.height = 64;
    const cCtx = cobbleCanvas.getContext('2d'); if (cCtx) { cCtx.fillStyle = '#1c1917'; cCtx.fillRect(0, 0, 64, 64); for(let i=0; i<30; i++) { cCtx.fillStyle = Math.random() > 0.5 ? '#292524' : '#44403c'; cCtx.globalAlpha = 0.6; cCtx.fillRect(Math.random()*64, Math.random()*64, 8 + Math.random()*12, 6 + Math.random()*8); } cCtx.globalAlpha = 1.0; }
    spritesRef.current.floorPatternCobble = cobbleCanvas;
    
    const roofCanvas = document.createElement('canvas'); roofCanvas.width = 32; roofCanvas.height = 32;
    const rCtx = roofCanvas.getContext('2d'); if (rCtx) { rCtx.fillStyle = '#1e293b'; rCtx.fillRect(0, 0, 32, 32); rCtx.strokeStyle = '#020617'; rCtx.lineWidth = 2; rCtx.beginPath(); for(let x=4; x<=32; x+=8) { rCtx.moveTo(x, 0); rCtx.lineTo(x, 32); } for(let y=0; y<=32; y+=8) { rCtx.moveTo(0, y); rCtx.lineTo(32, y); } rCtx.stroke(); }
    spritesRef.current.roofPattern = roofCanvas;
    
    const createRockTexture = (base: string, dark: string, light: string) => { const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; const ctx = canvas.getContext('2d'); if(!ctx) return canvas; ctx.fillStyle = base; ctx.fillRect(0,0,64,64); for(let i=0; i<200; i++) { ctx.fillStyle = Math.random() > 0.5 ? dark : light; ctx.globalAlpha = 0.3; ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2); } ctx.globalAlpha = 1.0; return canvas; };
    spritesRef.current.rockPatternTop = createRockTexture('#a8a29e', '#57534e', '#d6d3d1');
    spritesRef.current.rockPatternSide = createRockTexture('#78716c', '#292524', '#a8a29e');
  }, [scenario]);

  useEffect(() => {
    const loadSprite = (src: string, key: string) => { const img = new Image(); img.src = src; img.onload = () => { spritesRef.current[key] = img; }; };
    loadSprite(NINJA_SVG_UP, 'playerUp'); loadSprite(NINJA_SVG_DOWN, 'playerDown'); loadSprite(NINJA_SVG_LEFT, 'playerLeft'); loadSprite(NINJA_SVG_RIGHT, 'playerRight');
    loadSprite(ENEMY_SVG, 'enemy'); loadSprite(VAMPIRE_SVG, 'vampire'); loadSprite(KATANA_SVG, 'katana');
  }, []);

  useEffect(() => {
    if (initialState) {
        stateRef.current.score = initialState.score || 0;
        stateRef.current.shurikens = initialState.shurikens || INITIAL_SHURIKENS;
        if (initialState.player) {
            Object.assign(stateRef.current.player, initialState.player);
        }
    }
    setupLevel(initialState?.wave || 1);
  }, [scenario, initialState]); 

  const setupLevel = (wave: number) => {
    const state = stateRef.current;
    state.wave = wave; state.enemies = []; state.projectiles = []; state.pickups = []; state.particles = []; state.fireZones = [];
    state.player.pos = { x: CANVAS_WIDTH / 2 - PLAYER_SIZE.w / 2, y: CANVAS_HEIGHT / 2 - PLAYER_SIZE.h / 2 };
    state.player.velocity = { x: 0, y: 0 };
    const walls: GameObject[] = []; const safeZoneRadius = 150; const center = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    
    if (scenario === 'KYOTO') {
        const snap = (val: number) => Math.floor(val / 40) * 40;
        const numHouses = 5 + Math.min(3, wave);
        for (let i = 0; i < numHouses; i++) {
            let attempts = 0, valid = false; let x = 0, y = 0, w = 0, h = 0;
            while (!valid && attempts < 50) {
                attempts++; w = snap(100 + Math.random() * 80); h = snap(80 + Math.random() * 60); x = snap(Math.random() * (CANVAS_WIDTH - w)); y = snap(Math.random() * (CANVAS_HEIGHT - h));
                if (Math.sqrt(Math.pow((x + w/2) - center.x, 2) + Math.pow((y + h/2) - center.y, 2)) < safeZoneRadius) continue;
                let overlap = false; for (const other of walls) { if (checkRectCollision({x,y,w,h}, { x: other.pos.x - 40, y: other.pos.y - 40, w: other.size.w + 80, h: other.size.h + 80 })) { overlap = true; break; } }
                if (!overlap) valid = true;
            }
            if (valid) {
                walls.push({ id: `house-${wave}-${i}`, type: EntityType.OBSTACLE, pos: { x, y }, size: { w, h }, color: '#334155', velocity: { x: 0, y: 0 }, health: 999, maxHealth: 999, isDead: false });
                if (Math.random() > 0.4) {
                    walls.push({ id: `lantern-${wave}-${i}`, type: EntityType.OBSTACLE, pos: { x: x - 10, y: y + h - 12 }, size: { w: 12, h: 12 }, color: COLORS.LANTERN_GLOW, velocity: { x: 0, y: 0 }, health: 999, maxHealth: 999, isDead: false });
                }
            }
        }
        for(let i=0; i<6; i++) {
            let tx = Math.random() * CANVAS_WIDTH, ty = Math.random() * CANVAS_HEIGHT;
            if (Math.abs(tx - center.x) > 100) walls.push({ id: `tree-${wave}-${i}`, type: EntityType.OBSTACLE, pos: { x: tx, y: ty }, size: { w: 40, h: 40 }, color: COLORS.TREE_TRUNK, velocity: { x: 0, y: 0 }, health: 999, maxHealth: 999, isDead: false });
        }
    } else {
        const numRocks = 5 + Math.min(3, wave);
        for (let i = 0; i < numRocks; i++) {
            let attempts = 0, valid = false; let x = 0, y = 0, w = 0, h = 0;
            while (!valid && attempts < 50) {
                attempts++; w = 50 + Math.random() * 60; h = 50 + Math.random() * 60; x = Math.random() * (CANVAS_WIDTH - w); y = Math.random() * (CANVAS_HEIGHT - h);
                if (Math.sqrt(Math.pow((x + w/2) - center.x, 2) + Math.pow((y + h/2) - center.y, 2)) < safeZoneRadius) continue;
                let overlap = false; for (const other of walls) { if (checkRectCollision({x,y,w,h}, { x: other.pos.x - 10, y: other.pos.y - 10, w: other.size.w + 20, h: other.size.h + 20 })) { overlap = true; break; } }
                if (!overlap) valid = true;
            }
            if (valid) walls.push({ id: `rock-${wave}-${i}`, type: EntityType.OBSTACLE, pos: { x, y }, size: { w, h }, color: COLORS.OBSTACLE, velocity: { x: 0, y: 0 }, health: 999, maxHealth: 999, isDead: false });
        }
        for(let i=0; i<10; i++) {
            let tx = Math.random() * CANVAS_WIDTH, ty = Math.random() * CANVAS_HEIGHT;
            if (Math.abs(tx - center.x) > 100) walls.push({ id: `tree-wild-${wave}-${i}`, type: EntityType.OBSTACLE, pos: { x: tx, y: ty }, size: { w: 40, h: 40 }, color: COLORS.TREE_TRUNK, velocity: { x: 0, y: 0 }, health: 999, maxHealth: 999, isDead: false });
        }
    }
    state.obstacles = walls;
    
    // Grid Setup
    const newGrid: boolean[][] = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      const row: boolean[] = []; for (let x = 0; x < GRID_COLS; x++) {
        const cellRect = { x: x * GRID_CELL_SIZE, y: y * GRID_CELL_SIZE, w: GRID_CELL_SIZE, h: GRID_CELL_SIZE };
        let blocked = false; for (const obs of state.obstacles) { if (checkRectCollision(cellRect, { x: obs.pos.x, y: obs.pos.y, w: obs.size.w, h: obs.size.h })) { blocked = true; break; } }
        row.push(!blocked);
      }
      newGrid.push(row);
    }
    gridRef.current = newGrid;
    spawnWave(3 + Math.floor(wave * 1.5), wave);
  };

  const spawnWave = (count: number, wave: number) => {
      const state = stateRef.current; const vampireChance = Math.min(0.5, (wave - 1) * 0.1);
      for(let i=0; i<count; i++) {
          let x = 0, y = 0, valid = false, att = 0;
          while (!valid && att < 50) {
              att++; x = Math.random() * (CANVAS_WIDTH - 40); y = Math.random() * (CANVAS_HEIGHT - 40);
              if (Math.abs(x - state.player.pos.x) < 200 && Math.abs(y - state.player.pos.y) < 200) continue;
              let inWall = false; for (const obs of state.obstacles) { if (checkRectCollision({x,y,w:ENEMY_SIZE.w, h:ENEMY_SIZE.h}, { x: obs.pos.x, y: obs.pos.y, w: obs.size.w, h: obs.size.h })) { inWall = true; break; } }
              if (!inWall) valid = true;
          }
          if (valid) {
              const isVamp = Math.random() < vampireChance; const type = isVamp ? EntityType.VAMPIRE : EntityType.ENEMY;
              const h = isVamp ? 3 : 2;
              state.enemies.push({ id: generateId(), type, pos: { x, y }, size: ENEMY_SIZE, color: isVamp ? COLORS.VAMPIRE : COLORS.ENEMY, velocity: { x: 0, y: 0 }, health: h, maxHealth: h, isDead: false, path: [], pathTimer: 0, attackTimer: Math.random() * VAMPIRE_ATTACK_COOLDOWN, weight: isVamp ? UNIT_WEIGHTS.VAMPIRE : UNIT_WEIGHTS.SAMURAI });
          }
      }
  };

  useEffect(() => {
    const hDown = (e: KeyboardEvent) => { switch (e.code) { case 'KeyW': case 'ArrowUp': inputRef.current.up = true; break; case 'KeyS': case 'ArrowDown': inputRef.current.down = true; break; case 'KeyA': case 'ArrowLeft': inputRef.current.left = true; break; case 'KeyD': case 'ArrowRight': inputRef.current.right = true; break; case 'Space': inputRef.current.attack = true; break; case 'ShiftLeft': case 'ShiftRight': inputRef.current.dash = true; break; case 'KeyE': inputRef.current.special = true; break; case 'KeyQ': inputRef.current.skill1 = true; break; } };
    const hUp = (e: KeyboardEvent) => { switch (e.code) { case 'KeyW': case 'ArrowUp': inputRef.current.up = false; break; case 'KeyS': case 'ArrowDown': inputRef.current.down = false; break; case 'KeyA': case 'ArrowLeft': inputRef.current.left = false; break; case 'KeyD': case 'ArrowRight': inputRef.current.right = false; break; case 'Space': inputRef.current.attack = false; break; case 'ShiftLeft': case 'ShiftRight': inputRef.current.dash = false; break; case 'KeyE': inputRef.current.special = false; break; case 'KeyQ': inputRef.current.skill1 = false; break; } };
    const hMDown = (e: MouseEvent) => { if (e.button === 0) inputRef.current.shoot = true; };
    const hMUp = (e: MouseEvent) => { if (e.button === 0) inputRef.current.shoot = false; };
    const hMMove = (e: MouseEvent) => { const c = canvasRef.current; if (!c) return; const r = c.getBoundingClientRect(); const sX = c.width / r.width; const sY = c.height / r.height; inputRef.current.mousePos = { x: (e.clientX - r.left) * sX, y: (e.clientY - r.top) * sY }; };
    window.addEventListener('keydown', hDown); window.addEventListener('keyup', hUp); window.addEventListener('mousedown', hMDown); window.addEventListener('mouseup', hMUp); window.addEventListener('mousemove', hMMove);
    return () => { window.removeEventListener('keydown', hDown); window.removeEventListener('keyup', hUp); window.removeEventListener('mousedown', hMDown); window.removeEventListener('mouseup', hMUp); window.removeEventListener('mousemove', hMMove); };
  }, []);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    let aId: number;
    const loop = (ts: number) => {
      if (stateRef.current.isGameOver || isPaused) { lastTimeRef.current = ts; if (isPaused) draw(ctx, stateRef.current); aId = requestAnimationFrame(loop); return; }
      const dt = (ts - lastTimeRef.current) / 1000; lastTimeRef.current = ts;
      update(dt); draw(ctx, stateRef.current); setGameStateRef({ ...stateRef.current }); aId = requestAnimationFrame(loop);
    };
    aId = requestAnimationFrame(loop); return () => cancelAnimationFrame(aId);
  }, [isPaused, scenario]);

  const update = (dt: number) => {
    const s = stateRef.current; const i = inputRef.current;
    if (s.player.chakra !== undefined && s.player.maxChakra !== undefined) { s.player.chakra = Math.min(s.player.maxChakra, s.player.chakra + CHAKRA_REGEN * dt); }
    if (s.enemies.length === 0 && !roomTransitionRef.current && !s.isGameOver) { 
        roomTransitionRef.current = true; 
        transitionTimerRef.current = 0.1; // Reduced from 2.0 to make it instant
    }
    if (roomTransitionRef.current) { 
        transitionTimerRef.current -= dt; 
        if (transitionTimerRef.current <= 0) { 
            roomTransitionRef.current = false; 
            onLevelComplete({ ...s, wave: s.wave + 1 }); 
        } 
    }
    
    // Cooldowns
    if (dashCooldownRef.current > 0) dashCooldownRef.current -= dt;
    if (dashTimeRef.current > 0) dashTimeRef.current -= dt;
    if (lightningBladeCooldownRef.current > 0) lightningBladeCooldownRef.current -= dt;
    if (lightningBladeTimeRef.current > 0) lightningBladeTimeRef.current -= dt;
    if (s.player.invulnerableTimer && s.player.invulnerableTimer > 0) s.player.invulnerableTimer -= dt;
    if (fireballCooldownRef.current > 0) fireballCooldownRef.current = Math.max(0, fireballCooldownRef.current - dt);
    
    s.fireballCooldown = fireballCooldownRef.current;
    s.lightningBladeCooldown = lightningBladeCooldownRef.current;

    ambientParticlesRef.current.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.sway += p.swayOffset; p.x += Math.sin(p.sway) * 0.5; if (p.x < -10) p.x = CANVAS_WIDTH + 10; if (p.y > CANVAS_HEIGHT + 10) p.y = -10; });
    
    // Skills Handling
    // 1. Lightning Blade (Q)
    if (i.skill1 && lightningBladeCooldownRef.current <= 0 && s.player.chakra! >= LIGHTNING_BLADE_COST) {
        s.player.chakra! -= LIGHTNING_BLADE_COST;
        lightningBladeCooldownRef.current = LIGHTNING_BLADE_COOLDOWN;
        lightningBladeTimeRef.current = LIGHTNING_BLADE_DURATION;
        lightningTrailRef.current = [{x: s.player.pos.x + 16, y: s.player.pos.y + 16}];
        
        let dx = 0, dy = 0;
        if (i.up) dy -= 1; if (i.down) dy += 1; if (i.left) dx -= 1; if (i.right) dx += 1;
        if (dx === 0 && dy === 0) { if (facingRef.current === 'up') dy = -1; else if (facingRef.current === 'down') dy = 1; else if (facingRef.current === 'left') dx = -1; else if (facingRef.current === 'right') dx = 1; }
        const l = Math.sqrt(dx*dx + dy*dy); if (l > 0) { dx /= l; dy /= l; }
        lightningBladeVelocityRef.current = { x: dx * LIGHTNING_BLADE_SPEED, y: dy * LIGHTNING_BLADE_SPEED };
        s.player.invulnerableTimer = LIGHTNING_BLADE_DURATION + 0.1;
    }

    // Movement Logic
    let nP = { x: s.player.pos.x, y: s.player.pos.y };
    if (lightningBladeTimeRef.current > 0) {
        nP.x += lightningBladeVelocityRef.current.x * dt;
        nP.y += lightningBladeVelocityRef.current.y * dt;
        lightningTrailRef.current.push({x: nP.x + 16, y: nP.y + 16});
        // Damage enemies in path
        s.enemies.forEach(e => {
            if (checkCollision({ ...s.player, pos: nP }, e)) {
                e.health -= LIGHTNING_BLADE_DAMAGE;
                spawnParticles(e.pos, 8, COLORS.LIGHTNING);
            }
        });
    } else if (dashTimeRef.current > 0) {
      nP.x += dashVelocityRef.current.x * dt; nP.y += dashVelocityRef.current.y * dt; 
    } else {
      const mD = { x: 0, y: 0 }; if (i.up) mD.y -= 1; if (i.down) mD.y += 1; if (i.left) mD.x -= 1; if (i.right) mD.x += 1;
      if (mD.y < 0) facingRef.current = 'up'; else if (mD.y > 0) facingRef.current = 'down'; else if (mD.x < 0) facingRef.current = 'left'; else if (mD.x > 0) facingRef.current = 'right';
      if (mD.x !== 0 || mD.y !== 0) { const l = Math.sqrt(mD.x*mD.x+mD.y*mD.y); mD.x/=l; mD.y/=l; }
      nP.x += mD.x * PLAYER_SPEED * (s.player.speedMult || 1) * dt; nP.y += mD.y * PLAYER_SPEED * (s.player.speedMult || 1) * dt;
    }

    if (i.dash && dashCooldownRef.current <= 0 && dashTimeRef.current <= 0 && lightningBladeTimeRef.current <= 0) {
        let dx = 0, dy = 0; if (i.up) dy -= 1; if (i.down) dy += 1; if (i.left) dx -= 1; if (i.right) dx += 1;
        if (dx === 0 && dy === 0) { if (facingRef.current === 'up') dy = -1; else if (facingRef.current === 'down') dy = 1; else if (facingRef.current === 'left') dx = -1; else if (facingRef.current === 'right') dx = 1; }
        const l = Math.sqrt(dx*dx + dy*dy); if (l > 0) { dx /= l; dy /= l; }
        dashVelocityRef.current = { x: dx * PLAYER_DASH_SPEED, y: dy * PLAYER_DASH_SPEED }; dashTimeRef.current = DASH_DURATION; dashCooldownRef.current = DASH_COOLDOWN + (s.player.dashCooldownMod || 0); spawnParticles(s.player.pos, 10, '#ffffff');
    }

    nP.x = Math.max(0, Math.min(CANVAS_WIDTH - s.player.size.w, nP.x)); nP.y = Math.max(0, Math.min(CANVAS_HEIGHT - s.player.size.h, nP.y));
    let col = false; for (const obs of s.obstacles) { if (checkCollision({ ...s.player, pos: nP }, obs)) { col = true; break; } }
    if (!col) s.player.pos = nP;

    // Combat
    if (attackCooldownRef.current > 0) attackCooldownRef.current -= dt;
    if (i.attack && attackCooldownRef.current <= 0) {
      attackCooldownRef.current = 0.5; let fD = { x: 0, y: 0 }; if (facingRef.current === 'up') fD.y = -1; else if (facingRef.current === 'down') fD.y = 1; else if (facingRef.current === 'left') fD.x = -1; else if (facingRef.current === 'right') fD.x = 1;
      s.enemies.forEach(e => { const dx = (e.pos.x + 16) - (s.player.pos.x + 16), dy = (e.pos.y + 16) - (s.player.pos.y + 16), d = Math.sqrt(dx*dx + dy*dy); if (d < 65) { const nx = dx / d, ny = dy / d, dot = nx * fD.x + ny * fD.y; if (dot > 0.3) { e.health -= 1; e.pos.x += nx * 60; e.pos.y += ny * 60; spawnParticles(e.pos, 5, COLORS.ENEMY_AGGRO); } } });
    }
    if (i.special && fireballCooldownRef.current <= 0 && s.player.chakra !== undefined && s.player.chakra >= FIREBALL_COST) {
        s.player.chakra -= FIREBALL_COST; fireballCooldownRef.current = FIREBALL_COOLDOWN + (s.player.fireballCooldownMod || 0);
        const pC = { x: s.player.pos.x + 16, y: s.player.pos.y + 16 }, dx = i.mousePos.x - pC.x, dy = i.mousePos.y - pC.y, d = Math.sqrt(dx*dx + dy*dy);
        let dir = d > 0 ? { x: dx/d, y: dy/d } : { x: 1, y: 0 };
        s.projectiles.push({ id: generateId(), type: EntityType.FIREBALL, pos: { x: pC.x - 10, y: pC.y - 10 }, size: { w: 20, h: 20 }, color: COLORS.FIREBALL, velocity: { x: dir.x * FIREBALL_SPEED, y: dir.y * FIREBALL_SPEED }, health: 1, maxHealth: 1, isDead: false, startPos: { ...pC } });
        spawnParticles(s.player.pos, 10, COLORS.FIREBALL);
    }
    if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;
    if (i.shoot && shootCooldownRef.current <= 0 && s.shurikens > 0) {
      shootCooldownRef.current = 0.3; s.shurikens--; const pC = { x: s.player.pos.x + 16, y: s.player.pos.y + 16 }, dx = i.mousePos.x - pC.x, dy = i.mousePos.y - pC.y, d = Math.sqrt(dx*dx + dy*dy);
      let dir = d > 0 ? { x: dx/d, y: dy/d } : { x: 1, y: 0 };
      s.projectiles.push({ id: generateId(), type: EntityType.PROJECTILE, pos: { x: pC.x - 4, y: pC.y - 4 }, size: { w: 8, h: 8 }, color: COLORS.PROJECTILE, velocity: { x: dir.x * PROJECTILE_SPEED, y: dir.y * PROJECTILE_SPEED }, health: 1, maxHealth: 1, isDead: false });
    }
    
    // Projectiles & Collision
    s.projectiles.forEach(p => {
      p.pos.x += p.velocity.x * dt; p.pos.y += p.velocity.y * dt;
      if (p.pos.x < 0 || p.pos.x > CANVAS_WIDTH || p.pos.y < 0 || p.pos.y > CANVAS_HEIGHT) p.isDead = true;
      if (p.type === EntityType.FIREBALL && !p.isDead) {
          let explode = false; if (p.startPos) { const d = Math.sqrt(Math.pow(p.pos.x - p.startPos.x,2) + Math.pow(p.pos.y - p.startPos.y,2)); if (d >= FIREBALL_RANGE) explode = true; }
          if (!explode) for (const o of s.obstacles) if (checkCollision(p, o)) { explode = true; break; }
          if (!explode) for (const e of s.enemies) if (checkCollision(p, e)) { explode = true; break; }
          if (explode) { p.isDead = true; triggerExplosion(p.pos); }
      } else if (p.type === EntityType.PROJECTILE) { s.enemies.forEach(e => { if (!p.isDead && e.health > 0 && checkCollision(p, e)) { e.health -= 1; p.isDead = true; spawnParticles(e.pos, 3, COLORS.ENEMY); } }); }
      else if (p.type === EntityType.ENEMY_PROJECTILE) { if (!p.isDead && checkCollision(p, s.player)) { if (!s.player.invulnerableTimer || s.player.invulnerableTimer <= 0) { s.player.health -= 1; s.player.invulnerableTimer = 2.0; if (s.player.health <= 0) s.isGameOver = true; } p.isDead = true; } if (!p.isDead) for (const o of s.obstacles) if (checkCollision(p, o)) { p.isDead = true; break; } }
    });
    s.projectiles = s.projectiles.filter(p => !p.isDead);
    s.fireZones.forEach(z => { z.lifeTime -= dt; z.tickTimer -= dt; if (z.tickTimer <= 0) { z.tickTimer = FIRE_ZONE_TICK_RATE; const cx = z.pos.x + z.size.w/2, cy = z.pos.y + z.size.h/2; s.enemies.forEach(e => { if (e.health > 0) { const d = Math.sqrt(Math.pow((e.pos.x+16)-cx,2)+Math.pow((e.pos.y+16)-cy,2)); if (d < EXPLOSION_RADIUS + 16) e.health -= FIRE_ZONE_DAMAGE; } }); } });
    s.fireZones = s.fireZones.filter(z => z.lifeTime > 0);
    s.enemies.forEach(e => {
      if (e.health <= 0) { e.deathTimer = (e.deathTimer || DEATH_DURATION) - dt; if (e.deathTimer <= 0) { e.isDead = true; s.score += 10; s.pickups.push({ id: generateId(), type: EntityType.PICKUP, pos: { x: e.pos.x + 11, y: e.pos.y + 11 }, size: XP_ORB_SIZE, color: COLORS.XP_ORB, velocity: { x: 0, y: 0 }, health: 1, maxHealth: 1, isDead: false, value: e.type === EntityType.VAMPIRE ? 30 : 10 }); } return; }
      const dxP = s.player.pos.x - e.pos.x, dyP = s.player.pos.y - e.pos.y, dP = Math.sqrt(dxP*dxP+dyP*dyP);
      let speed = e.type === EntityType.VAMPIRE ? VAMPIRE_SPEED : ENEMY_SPEED; if (e.swingTimer && e.swingTimer > 0) e.swingTimer -= dt; if (e.attackTimer && e.attackTimer > 0) e.attackTimer -= dt; if (e.lungeCooldown && e.lungeCooldown > 0) e.lungeCooldown -= dt;
      if (e.type === EntityType.ENEMY) { if (dP < 70 && (!e.attackTimer || e.attackTimer <= 0)) { e.swingTimer = 0.3; e.attackTimer = 1.5; if (!s.player.invulnerableTimer || s.player.invulnerableTimer <= 0) { s.player.health -= 1; s.player.invulnerableTimer = 2.0; if (s.player.health <= 0) s.isGameOver = true; } } if (e.lungeTimer && e.lungeTimer > 0) { e.lungeTimer -= dt; speed = ENEMY_LUNGE_SPEED; } else if (dP > 70 && dP < ENEMY_LUNGE_RANGE && (!e.lungeCooldown || e.lungeCooldown <= 0)) { e.lungeTimer = ENEMY_LUNGE_DURATION; e.lungeCooldown = ENEMY_LUNGE_COOLDOWN; } }
      else if (e.type === EntityType.VAMPIRE) { if (e.attackTimer <= 0 && dP < 500 && hasLineOfSight({x:e.pos.x+16,y:e.pos.y+16}, {x:s.player.pos.x+16,y:s.player.pos.y+16}, s.obstacles)) { e.attackTimer = VAMPIRE_ATTACK_COOLDOWN; s.projectiles.push({ id: generateId(), type: EntityType.ENEMY_PROJECTILE, pos: { x: e.pos.x+16, y: e.pos.y+16 }, size: { w: 10, h: 10 }, color: COLORS.ENEMY_PROJECTILE, velocity: { x: (dxP/dP)*ENEMY_PROJECTILE_SPEED, y: (dyP/dP)*ENEMY_PROJECTILE_SPEED }, health: 1, maxHealth: 1, isDead: false }); } }
      if (!e.lungeTimer || e.lungeTimer <= 0) { e.pathTimer = (e.pathTimer || 0) - dt; if (e.pathTimer <= 0) { e.path = findPath(e.pos, s.player.pos, gridRef.current); e.pathTimer = 0.5 + Math.random()*0.5; } }
      let move = { x: 0, y: 0 }; if (e.swingTimer && e.swingTimer > 0) speed = 0; else if (e.path && e.path.length > 0) { const w = e.path[0], dx = w.x - e.pos.x, dy = w.y - e.pos.y, dw = Math.sqrt(dx*dx+dy*dy); if (dw < 10) e.path.shift(); if (dw > 0) { move.x = dx/dw; move.y = dy/dw; } } else if (dP > 0) { move.x = dxP/dP; move.y = dyP/dP; }
      const oldX = e.pos.x; e.pos.x += move.x * speed * dt; if (s.obstacles.some(o => checkCollision(e, o))) e.pos.x = oldX;
      const oldY = e.pos.y; e.pos.y += move.y * speed * dt; if (s.obstacles.some(o => checkCollision(e, o))) e.pos.y = oldY;
    });
    s.enemies = s.enemies.filter(e => !e.isDead);
    s.pickups.forEach(p => {
        const d = Math.sqrt(Math.pow((s.player.pos.x+16)-(p.pos.x+5),2)+Math.pow((s.player.pos.y+16)-(p.pos.y+5),2));
        if (d < 150) { const sX = 150*(1-d/150)+50; p.pos.x += ((s.player.pos.x+16)-(p.pos.x+5))/d*sX*dt; p.pos.y += ((s.player.pos.y+16)-(p.pos.y+5))/d*sX*dt; }
        if (checkCollision(p, s.player)) { p.isDead = true; s.player.xp! += p.value || 10; if (s.player.xp! >= s.player.maxXp!) { s.player.xp! -= s.player.maxXp!; s.player.level!++; s.player.maxXp = Math.floor(s.player.maxXp! * 1.5); onLevelUp({ ...s }); } }
    });
    s.pickups = s.pickups.filter(p => !p.isDead);
    s.particles.forEach(p => { p.lifeTime -= dt; p.pos.x += p.velocity.x * dt; p.pos.y += p.velocity.y * dt; });
    s.particles = s.particles.filter(p => p.lifeTime > 0);
  };

  const triggerExplosion = (pos: Vector2) => { spawnParticles(pos, 20, COLORS.EXPLOSION); const cx = pos.x + 10, cy = pos.y + 10; sRef().enemies.forEach(e => { if (e.health > 0) { const d = Math.sqrt(Math.pow((e.pos.x+16)-cx,2)+Math.pow((e.pos.y+16)-cy,2)); if (d < EXPLOSION_RADIUS + 16) { e.health -= FIREBALL_DAMAGE; e.pos.x += ((e.pos.x+16)-cx)/d*10; e.pos.y += ((e.pos.y+16)-cy)/d*10; } } }); sRef().fireZones.push({ id: generateId(), type: EntityType.FIRE_ZONE, pos: { x: cx - EXPLOSION_RADIUS, y: cy - EXPLOSION_RADIUS }, size: { w: EXPLOSION_RADIUS * 2, h: EXPLOSION_RADIUS * 2 }, color: COLORS.FIRE_ZONE_CORE, velocity: { x: 0, y: 0 }, health: 0, maxHealth: 0, isDead: false, lifeTime: FIRE_ZONE_DURATION, maxLifeTime: FIRE_ZONE_DURATION, tickTimer: 0 }); };
  const spawnParticles = (pos: Vector2, count: number, color: string) => { for(let i=0; i<count; i++) sRef().particles.push({ id: generateId(), type: EntityType.EFFECT, pos: { x: pos.x + 16, y: pos.y + 16 }, size: { w: 3, h: 3 }, color, velocity: { x: (Math.random()-0.5)*100, y: (Math.random()-0.5)*100 }, health: 0, maxHealth: 0, isDead: false, lifeTime: 0.5, maxLifeTime: 0.5 }); };
  const sRef = () => stateRef.current;

  // Obstacle Rendering
  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: GameObject) => {
    const { x, y } = obs.pos;
    const { w, h } = obs.size;
    if (obs.id.startsWith('house')) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 10, y + 10, w, h); 
        ctx.fillStyle = COLORS.WOOD_DARK; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
        ctx.fillStyle = COLORS.WOOD_LIGHT; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4); 
        if (spritesRef.current.roofPattern) {
            const ptrn = ctx.createPattern(spritesRef.current.roofPattern, 'repeat');
            ctx.fillStyle = ptrn || '#1e293b';
        } else ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#020617'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
        ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = '#334155';
        if (w > h) { ctx.moveTo(x + 10, y + h/2); ctx.lineTo(x + w - 10, y + h/2); }
        else { ctx.moveTo(x + w/2, y + 10); ctx.lineTo(x + w/2, y + h - 10); }
        ctx.stroke();
    } else if (obs.id.startsWith('lantern')) {
        const cx = x + w/2, cy = y + h/2;
        const glow = 25 + Math.sin(Date.now()/200)*3;
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, glow);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.5)'); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, glow, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = COLORS.LANTERN_PAPER; ctx.shadowColor = COLORS.LANTERN_GLOW; ctx.shadowBlur = 10;
        ctx.fillRect(x, y, w, h); ctx.shadowBlur = 0;
    } else if (obs.id.startsWith('tree')) {
        let seed = 0; for(let i=0; i<obs.id.length; i++) seed = ((seed<<5)-seed)+obs.id.charCodeAt(i);
        const rng = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
        const isWild = obs.id.includes('wild');
        const cLight = isWild ? COLORS.TREE_GREEN_LIGHT : COLORS.TREE_SAKURA;
        const cDark = isWild ? COLORS.TREE_GREEN_DARK : COLORS.TREE_SAKURA_DARK;
        const cx = x + w/2, cy = y + h/2;
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx, cy + h/2 - 4, w/1.6, h/5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = COLORS.TREE_TRUNK; ctx.beginPath(); ctx.moveTo(cx - 4, cy + h/2); ctx.quadraticCurveTo(cx, cy, cx - 10, cy - h/2); ctx.lineTo(cx + 10, cy - h/2); ctx.quadraticCurveTo(cx, cy, cx + 4, cy + h/2); ctx.fill();
        const drawCluster = (ox: number, oy: number, r: number, color: string) => {
            ctx.fillStyle = color; ctx.beginPath(); 
            for(let j=0; j<5; j++) { const a = (j/5)*Math.PI*2; ctx.arc(ox + Math.cos(a)*r*0.5, oy + Math.sin(a)*r*0.5, r*(0.7+rng()*0.3), 0, Math.PI*2); }
            ctx.fill();
        };
        drawCluster(cx - 8, cy - h*0.2, w*0.4, cDark); drawCluster(cx + 8, cy - h*0.25, w*0.35, cDark);
        drawCluster(cx, cy - h*0.4, w*0.4, cLight); drawCluster(cx, cy - h*0.6, w*0.3, cLight);
    } else if (obs.id.startsWith('rock')) {
        let seed = 0; for(let i=0; i<obs.id.length; i++) seed = ((seed<<5)-seed)+obs.id.charCodeAt(i);
        const rng = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
        const cx = x + w/2, cy = y + h/2;
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(cx+4, cy+4, w/2, h/2, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); for(let i=0; i<8; i++) { const a = (i/8)*Math.PI*2, r = (w/2)*(0.8+rng()*0.4); ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r); } ctx.closePath();
        if (spritesRef.current.rockPatternTop) { const p = ctx.createPattern(spritesRef.current.rockPatternTop, 'repeat'); ctx.fillStyle = p || '#57534e'; }
        else ctx.fillStyle = '#57534e';
        ctx.fill(); ctx.strokeStyle = '#292524'; ctx.lineWidth = 1.5; ctx.stroke();
    } else {
        ctx.fillStyle = obs.color; ctx.fillRect(x, y, w, h);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, s: GameState) => {
    // Background Patterns
    if (scenario === 'KYOTO' && spritesRef.current.floorPatternCobble) {
        const ptrn = ctx.createPattern(spritesRef.current.floorPatternCobble, 'repeat'); ctx.fillStyle = ptrn || '#1c1917';
    } else if (scenario === 'WILDERNESS' && spritesRef.current.floorPatternGrass) {
        const ptrn = ctx.createPattern(spritesRef.current.floorPatternGrass, 'repeat'); ctx.fillStyle = ptrn || '#14532d';
    } else {
        ctx.fillStyle = scenario === 'KYOTO' ? '#1c1917' : '#14532d';
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    s.fireZones.forEach(z => { const cx = z.pos.x + z.size.w/2, cy = z.pos.y + z.size.h/2, r = z.size.w/2; const g = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r); g.addColorStop(0, COLORS.FIRE_ZONE_CORE); g.addColorStop(0.7, COLORS.FIRE_ZONE_EDGE); g.addColorStop(1, 'transparent'); ctx.globalAlpha = 0.4; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; });
    
    // Lightning Trail Effect
    if (lightningTrailRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = COLORS.LIGHTNING;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.LIGHTNING;
        ctx.beginPath();
        ctx.moveTo(lightningTrailRef.current[0].x, lightningTrailRef.current[0].y);
        for (let i = 1; i < lightningTrailRef.current.length; i++) {
            const p = lightningTrailRef.current[i];
            const ox = (Math.random() - 0.5) * 10;
            const oy = (Math.random() - 0.5) * 10;
            ctx.lineTo(p.x + ox, p.y + oy);
        }
        ctx.stroke();
        
        ctx.strokeStyle = COLORS.LIGHTNING_WHITE;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        
        // Decay trail
        if (lightningBladeTimeRef.current <= 0) {
            lightningTrailRef.current.shift();
            lightningTrailRef.current.shift();
            if (lightningTrailRef.current.length < 2) lightningTrailRef.current = [];
        }
    }

    s.obstacles.forEach(o => drawObstacle(ctx, o));
    s.pickups.forEach(p => { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.pos.x+5, p.pos.y+5, 5, 0, Math.PI*2); ctx.fill(); });
    s.particles.forEach(p => { ctx.globalAlpha = p.lifeTime/p.maxLifeTime; ctx.fillStyle = p.color; ctx.fillRect(p.pos.x, p.pos.y, p.size.w, p.size.h); ctx.globalAlpha = 1; });
    
    // Player
    const pS = spritesRef.current[`player${facingRef.current.charAt(0).toUpperCase() + facingRef.current.slice(1)}`];
    if (s.player.invulnerableTimer && s.player.invulnerableTimer > 0 && Math.floor(s.player.invulnerableTimer*10)%2===0) ctx.globalAlpha = 0.4;
    
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(s.player.pos.x + 16, s.player.pos.y + 28, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
    
    if (pS) ctx.drawImage(pS as any, s.player.pos.x, s.player.pos.y, 32, 32); 
    else { ctx.fillStyle = s.player.color; ctx.fillRect(s.player.pos.x, s.player.pos.y, 32, 32); }

    // Sword Visuals
    const timeSinceAttack = 0.5 - attackCooldownRef.current;
    if (timeSinceAttack < 0.2 && timeSinceAttack >= 0 && spritesRef.current.katana) {
      const prog = timeSinceAttack / 0.2;
      let baseA = 0;
      if (facingRef.current === 'right') baseA = 0; else if (facingRef.current === 'down') baseA = Math.PI/2; else if (facingRef.current === 'left') baseA = Math.PI; else if (facingRef.current === 'up') baseA = -Math.PI/2;
      const curA = baseA - Math.PI/3 + (2*Math.PI/3)*prog;
      ctx.save(); ctx.translate(s.player.pos.x+16, s.player.pos.y+16); ctx.rotate(curA);
      ctx.drawImage(spritesRef.current.katana as any, 0, -16, 32, 32); ctx.restore();
    }
    ctx.globalAlpha = 1.0;

    // Enemies
    s.enemies.forEach(e => {
      let dying = false;
      if (e.health <= 0 && e.deathTimer !== undefined) {
        dying = true;
        ctx.globalAlpha = Math.max(0, e.deathTimer / DEATH_DURATION);
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 4, 0);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(e.pos.x + 16, e.pos.y + 28, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const spr = spritesRef.current[e.type === EntityType.VAMPIRE ? 'vampire' : 'enemy'];
      if (spr) ctx.drawImage(spr as any, e.pos.x, e.pos.y, 32, 32);
      else {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.pos.x, e.pos.y, 32, 32);
      }

      if (!dying && e.type === EntityType.ENEMY && e.swingTimer && e.swingTimer > 0 && spritesRef.current.katana) {
          const prog = 1 - (e.swingTimer / 0.3);
          const baseA = Math.atan2((s.player.pos.y + 16) - (e.pos.y + 16), (s.player.pos.x + 16) - (e.pos.x + 16));
          const curA = baseA - Math.PI / 3 + (2 * Math.PI / 3) * prog;
          ctx.save();
          ctx.translate(e.pos.x + 16, e.pos.y + 16);
          ctx.rotate(curA);
          ctx.drawImage(spritesRef.current.katana as any, 0, -16, 32, 32);
          ctx.restore();
      }

      if (dying) { ctx.restore(); ctx.globalAlpha = 1.0; }
    });

    s.projectiles.forEach(p => { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.pos.x+p.size.w/2, p.pos.y+p.size.h/2, p.size.w/2, 0, Math.PI*2); ctx.fill(); });
    
    // Vignette
    const g = ctx.createRadialGradient(s.player.pos.x+16, s.player.pos.y+16, 150, s.player.pos.x+16, s.player.pos.y+16, 700); g.addColorStop(0, 'transparent'); g.addColorStop(1, 'rgba(15, 23, 42, 0.9)'); ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-4 border-stone-800 shadow-2xl bg-black rounded cursor-crosshair" />;
};
