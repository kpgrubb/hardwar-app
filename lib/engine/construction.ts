// ============================================
// Hardwar Element Construction Rules Engine
// Rulebook pp.169-174
// ============================================

export type ElementType = "Walker" | "Trooper" | "Vehicle" | "Aircraft" | "Defence";

export const ELEMENT_TYPES: ElementType[] = ["Walker", "Trooper", "Vehicle", "Aircraft", "Defence"];

// CP Table by Class and Type (rulebook p.171)
const CP_TABLE: Record<ElementType, Record<number, number>> = {
  Walker:   { 1: 11, 2: 14, 3: 17, 4: 20 },
  Trooper:  { 1: 11, 2: 14, 3: 17 },  // No C4+
  Vehicle:  { 1: 11, 2: 14, 3: 17, 4: 20 },
  Aircraft: { 1: 0, 2: 0, 3: 0, 4: 0 },  // Calculated dynamically
  Defence:  { 1: 11, 2: 14, 3: 17, 4: 20 },
};

export function getBaseCP(type: ElementType, classLevel: number): number {
  if (type === "Aircraft") {
    // Aircraft: (class * 2) + 8 + M (M added later as it's allocated)
    return (classLevel * 2) + 8;
  }
  return CP_TABLE[type]?.[classLevel] ?? 0;
}

export function getMaxClass(type: ElementType): number {
  return type === "Trooper" ? 3 : 4;
}

// Motive types available per element type
export const MOTIVE_TYPES: Record<ElementType, string[]> = {
  Walker: ["Walker"],
  Trooper: ["Infantry", "Wheeled", "Hovercraft"],
  Vehicle: ["Tracked", "Wheeled", "Hovercraft", "Watercraft", "Rail"],
  Aircraft: ["Fixed-Wing", "Omnidirectional"],
  Defence: ["Defence"],
};

// All weapon upgrades (1 CP each, p.148-154)
export const WEAPON_UPGRADES = [
  { id: "anti-aircraft", name: "Anti-Aircraft", desc: "Ignores height difference to Aircraft" },
  { id: "bot-taser", name: "Bot-Taser", desc: "CC: removes 1 action from target, cancels Guard/Spotter" },
  { id: "cloak-projector", name: "Cloak Projector", desc: "Enemy can't trace LoF unless spotted by more elements than current F" },
  { id: "close-combat-attachment", name: "Close Combat Attachment", desc: "+1C during Charge/CC" },
  { id: "disruptor-field", name: "Disruptor Field", desc: "Creates F\" of Cover in 3\" frontal arc" },
  { id: "dual", name: "Dual", desc: "Re-roll one attack die per shot" },
  { id: "energy-blade", name: "Energy Blade", desc: "CC dice become Augment on 11-12" },
  { id: "flamethrower", name: "Flamethrower", desc: "Auto-hits corridor 1\" wide, F\" long. Ignores Cover. Must Reload." },
  { id: "flechette", name: "Flechette", desc: "Double damage to Troopers" },
  { id: "force-shield", name: "Force Shield Generator", desc: "Incoming attacks through bubble: F halved. 180° frontal, F\" radius" },
  { id: "gaser", name: "Gaser", desc: "Hit = Crash from elevation 1. Extra hits add height." },
  { id: "gatling", name: "Gatling", desc: "-2 to target's Armour distance modifier" },
  { id: "glue-gun", name: "Glue Gun", desc: "1+ hit = target's M halved. Removable by Repair." },
  { id: "guided-fire", name: "Guided Fire", desc: "Attack without LoS using Spotter. Range from Spotter element." },
  { id: "harpoon", name: "Harpoon", desc: "1 hit sacrificed to grapple (locked in CC at distance)" },
  { id: "indirect-fire", name: "Indirect Fire", desc: "Attack without LoS. Full F with Spotter, -1F with Relay, half F otherwise." },
  { id: "ion-cannon", name: "Ion Cannon", desc: "EMP effect on hit" },
  { id: "laser", name: "Laser", desc: "Standard energy weapon" },
  { id: "monostring", name: "Monostring Launcher", desc: "No damage, but movement becomes Dangerous terrain permanently" },
  { id: "neutron-scrambler", name: "Neutron Scrambler", desc: "All damage must go to D stat. Only criticals to other stats." },
  { id: "plasma", name: "Plasma Accelerator", desc: "Successful attack (1+ damage) = +1 non-critical hit" },
  { id: "pyrogel", name: "Pyrogel", desc: "First hit sets target ablaze (+3 Cover Smokescreen)" },
  { id: "railgun", name: "Railgun", desc: "First damage point is always critical" },
  { id: "ramming", name: "Ramming Attachment", desc: "+1C in Charge. Vehicles only." },
  { id: "shield", name: "Shield", desc: "Ignore Suppressive Fire. Opponent -1C in Charge/CC. Walkers only." },
  { id: "smart", name: "Smart", desc: "-2 Cover modifier reduction" },
  { id: "sniper", name: "Sniper", desc: "Ignores Partial Cover entirely" },
  { id: "sonic-cannon", name: "Sonic Cannon", desc: "1+ hit = instant -1M, -1F, -1A. Complex Reload." },
  { id: "tank-shotgun", name: "Tank Shotgun", desc: "No Augmented Dice, no Criticals. Each hit doubled." },
  { id: "xmg", name: "XMG", desc: "Target's D reduced by 1 for attack resolution" },
];

// Performance upgrades (1 CP each, p.157-160)
export const PERFORMANCE_UPGRADES = [
  { id: "active-camo", name: "Active Camouflage", desc: "+2 Cover. First hit disables." },
  { id: "adaptable", name: "Adaptable", desc: "After deployment, move 1 stat point between M/F/A/D" },
  { id: "agile", name: "Agile", desc: "+1D in Defence rolls vs shooting. +1C in Charge/CC." },
  { id: "alert", name: "Alert", desc: "Always 360° Arc of Vision" },
  { id: "amphibious", name: "Amphibious", desc: "Ground crosses water at Patrol. Watercraft travels land at Patrol." },
  { id: "assisted-targeting", name: "Assisted Targeting", desc: "Re-roll 1 F die after D roll" },
  { id: "botjitsu", name: "Botjitsu Suite", desc: "Walkers: reroll 1D per Charge/CC" },
  { id: "bracing-mass", name: "Bracing Mass", desc: "Full F for Move & Shoot (not halved)" },
  { id: "combat-gyro", name: "Combat Gyro", desc: "Immune to Overkill Crashing effects" },
  { id: "drop-harness", name: "Drop Harness", desc: "Deploy transported elements without landing, max 3\"" },
  { id: "enclosed-turret", name: "Enclosed Turret Array", desc: "In Alert mode: 360° Arc of Fire" },
  { id: "fragmentation-screen", name: "Fragmentation Screen", desc: "First Charge/Counter-Charge: +2C. One-use." },
  { id: "full-strike", name: "Full Strike", desc: "+2F one attack, then -2F until Reload" },
  { id: "grasping-manipulators", name: "Grasping Manipulators", desc: "Walkers: Climb, Grab & Hold, Flip, Lift & Throw, etc." },
  { id: "gunnery-controller", name: "Gunnery Controller", desc: "Split F between two targets" },
  { id: "jump-jets", name: "Jump Jets", desc: "Short aerial movement. Exhausted after use, requires Reload." },
  { id: "minelayer", name: "Minelayer", desc: "Action (once/game): make 3\" diameter Dangerous Terrain" },
  { id: "nimble", name: "Nimble", desc: "Rapid in Difficult with no penalty. Re-roll Hazardous terrain dice." },
  { id: "orbital-entry", name: "Orbital Entry", desc: "Deep Deployment from Reserve without asset" },
  { id: "point-defence", name: "Point Defence", desc: "Re-roll 1 D die after F roll" },
  { id: "quantum-radar", name: "Quantum Radar", desc: "Scan action: detect elements within Fx12\" ignoring obstacles" },
  { id: "rapid", name: "Rapid", desc: "Move up to 3×M\". One facing change only." },
  { id: "regenerative-armour", name: "Regenerative Armour", desc: "Can Repair/Self-Repair Armour stat" },
  { id: "sat-lock", name: "Sat-Lock", desc: "+1F against targets with M 3 or less" },
  { id: "smokescreen", name: "Smokescreen", desc: "Action: +3 Cover until end of turn" },
  { id: "stealth", name: "Stealth", desc: "Does not trigger Guard response" },
  { id: "transport-bay", name: "Transport Bay", desc: "Carry elements up to C-1 total Class" },
  { id: "troop-transport", name: "Troop Transport", desc: "Carry Troopers up to own C total" },
  { id: "unhackable", name: "Unhackable", desc: "Immune to Hacker, EMP, Neutron Scrambler" },
  { id: "watchdog-drone", name: "Watchdog Drone", desc: "Establish LoF from any point within 3\" radius" },
  { id: "zombie-protocol", name: "Zombie Protocol", desc: "When wrecked, auto-moves under nearest friendly Hacker" },
];

// Special skills (1 CP each, p.153-157)
export const SPECIAL_SKILLS = [
  { id: "c-ram", name: "C-RAM", desc: "Add F dice to own D roll vs Guided/Indirect Fire" },
  { id: "chain-of-command", name: "Chain of Command", desc: "HQ generates 1 Command Token/turn" },
  { id: "combat-engineer", name: "Combat Engineer", desc: "Change terrain difficulty +/-1 level in C\" radius" },
  { id: "combat-hacker", name: "Combat Hacker", desc: "Assault Hack, Control Override, Duel, Overloads" },
  { id: "countermeasures", name: "Countermeasures", desc: "Remove all Relay Coordinates from self" },
  { id: "disposable-swarm", name: "Disposable Swarm Drones", desc: "One-shot C1 attack. Ignores terrain/LoS." },
  { id: "hauler", name: "Hauler", desc: "Haul elements of same motive type. 2×C capacity." },
  { id: "lifter", name: "Lifter", desc: "Aircraft only. Lift elements. 2×C capacity." },
  { id: "repair", name: "Repair", desc: "Base contact + action. Roll D vs Damage Bar to restore M/F/D." },
  { id: "self-repair", name: "Self-Repair", desc: "Same as Repair but on self" },
  { id: "spotter", name: "Spotter", desc: "Paint targets in LoS for Guided/Indirect Fire" },
  { id: "utility-hacker", name: "Utility Hacker", desc: "Duel, Lockdown, Lockpicker, Remote Assistance" },
];

// Flaws (+1 CP each, p.162-163)
export const FLAWS = [
  { id: "complex-reload", name: "Complex Reload", desc: "Must Reload after every Shoot action" },
  { id: "cumbersome", name: "Cumbersome", desc: "Cannot Move & Shoot. Incompatible with Bracing Mass." },
  { id: "design-flaw", name: "Design Flaw", desc: "First non-critical hit becomes critical. Not for Troopers." },
  { id: "incompatible-standard", name: "Incompatible Standard", desc: "Cannot be Repaired. Not with Self-Repair or Troopers." },
  { id: "incompatible-weapons", name: "Incompatible Weapon Systems", desc: "No Augmented Dice on attacks" },
  { id: "inferior-durability", name: "Inferior Durability", desc: "First hit inflicts +1 extra non-critical hit. Not for Troopers." },
  { id: "inferior-sensors", name: "Inferior Sensors", desc: "Cannot Guard" },
  { id: "live-operator", name: "Live Operator", desc: "Overkill Crashing = also Deactivated. Vehicles/Walkers only." },
  { id: "lumbering", name: "Lumbering", desc: "Cannot Guard. Incompatible with Alert." },
  { id: "obsolete", name: "Obsolete", desc: "+3 distance when firing" },
  { id: "primary-target", name: "Primary Target", desc: "Enemies get -3 distance when shooting at this element" },
  { id: "single-attack-mode", name: "Single Attack Mode", desc: "Can only attack with one specific Weapon Upgrade" },
  { id: "technical", name: "Technical", desc: "Civilian unit; Armour not added to opponent's Attack Roll" },
];

// Validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface CustomElement {
  name: string;
  type: ElementType;
  classLevel: number;
  motiveType: string;
  stats: { M: number; F: number; D: number; A: number };
  weaponUpgrades: string[];
  performanceUpgrades: string[];
  specialSkills: string[];
  flaws: string[];
  isExperimental: boolean;
}

export function calculateCP(element: CustomElement): {
  totalCP: number;
  spentCP: number;
  remainingCP: number;
  breakdown: { label: string; cost: number }[];
} {
  let totalCP = getBaseCP(element.type, element.classLevel);

  // Aircraft gets M added to base
  if (element.type === "Aircraft") {
    totalCP += element.stats.M;
  }

  // Experimental: +2 CP
  if (element.isExperimental) {
    totalCP += 2;
  }

  const breakdown: { label: string; cost: number }[] = [];

  // Stats
  const statTotal = element.stats.M + element.stats.F + element.stats.D + element.stats.A;
  breakdown.push({ label: `Stats (M${element.stats.M} F${element.stats.F} D${element.stats.D} A${element.stats.A})`, cost: statTotal });

  // Upgrades
  const upgradeCount = element.weaponUpgrades.length + element.performanceUpgrades.length + element.specialSkills.length;
  if (upgradeCount > 0) {
    breakdown.push({ label: `${element.weaponUpgrades.length} Weapons + ${element.performanceUpgrades.length} Performance + ${element.specialSkills.length} Skills`, cost: upgradeCount });
  }

  // Flaws (negative cost)
  const flawRefund = element.flaws.length;
  if (flawRefund > 0) {
    breakdown.push({ label: `${element.flaws.length} Flaw${element.flaws.length > 1 ? 's' : ''} (refund)`, cost: -flawRefund });
  }

  const spentCP = statTotal + upgradeCount - flawRefund;

  return { totalCP, spentCP, remainingCP: totalCP - spentCP, breakdown };
}

export function validate(element: CustomElement): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!element.name.trim()) {
    errors.push({ field: "name", message: "Element needs a name" });
  }

  // Min stats
  if (element.type !== "Defence" && element.stats.M < 1) {
    errors.push({ field: "M", message: "Minimum M is 1" });
  }
  if (element.stats.F < 1) {
    errors.push({ field: "F", message: "Minimum F is 1" });
  }
  if (element.stats.D < 1) {
    errors.push({ field: "D", message: "Minimum D is 1" });
  }
  if (element.stats.A < 1) {
    errors.push({ field: "A", message: "Minimum A is 1" });
  }

  // Aircraft: M >= Class
  if (element.type === "Aircraft" && element.stats.M < element.classLevel) {
    errors.push({ field: "M", message: `Aircraft M must be ≥ Class (${element.classLevel})` });
  }

  // Trooper: max C3
  if (element.type === "Trooper" && element.classLevel > 3) {
    errors.push({ field: "class", message: "Troopers cannot exceed Class 3" });
  }

  // CP budget
  const { remainingCP } = calculateCP(element);
  if (remainingCP < 0) {
    errors.push({ field: "cp", message: `Over budget by ${Math.abs(remainingCP)} CP` });
  }

  // Flaw restrictions
  if (element.type === "Trooper") {
    if (element.flaws.includes("design-flaw")) {
      errors.push({ field: "flaws", message: "Troopers cannot take Design Flaw" });
    }
    if (element.flaws.includes("incompatible-standard")) {
      errors.push({ field: "flaws", message: "Troopers cannot take Incompatible Standard" });
    }
    if (element.flaws.includes("inferior-durability")) {
      errors.push({ field: "flaws", message: "Troopers cannot take Inferior Durability" });
    }
  }

  // Incompatibilities
  if (element.flaws.includes("cumbersome") && element.performanceUpgrades.includes("bracing-mass")) {
    errors.push({ field: "flaws", message: "Cumbersome is incompatible with Bracing Mass" });
  }
  if (element.flaws.includes("lumbering") && element.performanceUpgrades.includes("alert")) {
    errors.push({ field: "flaws", message: "Lumbering is incompatible with Alert" });
  }

  // Experimental mandatory flaws
  if (element.isExperimental) {
    if (!element.flaws.includes("design-flaw")) {
      errors.push({ field: "experimental", message: "Experimental elements must take Design Flaw" });
    }
    if (!element.flaws.includes("incompatible-standard")) {
      errors.push({ field: "experimental", message: "Experimental elements must take Incompatible Standard" });
    }
    if (element.type === "Trooper") {
      errors.push({ field: "experimental", message: "Troopers cannot be Experimental" });
    }
  }

  return errors;
}
