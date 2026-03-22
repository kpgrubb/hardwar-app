import { rollD12, rollMultipleD12 } from "./dice";

const SPAWN_THRESHOLD = 8;

const SPAWN_CLASS_TABLE = [
  { min: 1, max: 3, result: "C1" },
  { min: 4, max: 6, result: "C2" },
  { min: 7, max: 8, result: "C3" },
  { min: 9, max: 10, result: "C4" },
  { min: 11, max: 12, result: "strategic_asset" },
];

const SPAWN_SUBTABLES: Record<string, Array<{ min: number; max: number; unit: string; motive: string }>> = {
  C1: [
    { min: 1, max: 4, unit: "Light Infantry", motive: "Trooper" },
    { min: 5, max: 9, unit: "Light Vehicle", motive: "Vehicle" },
    { min: 10, max: 11, unit: "Light Walker", motive: "Walker" },
    { min: 12, max: 12, unit: "Light Aircraft", motive: "Aircraft" },
  ],
  C2: [
    { min: 1, max: 3, unit: "Medium Infantry", motive: "Trooper" },
    { min: 4, max: 7, unit: "Medium Vehicle", motive: "Vehicle" },
    { min: 8, max: 10, unit: "Medium Walker", motive: "Walker" },
    { min: 11, max: 12, unit: "Medium Aircraft", motive: "Aircraft" },
  ],
  C3: [
    { min: 1, max: 2, unit: "Heavy Infantry", motive: "Trooper" },
    { min: 3, max: 6, unit: "Heavy Vehicle", motive: "Vehicle" },
    { min: 7, max: 10, unit: "Heavy Walker", motive: "Walker" },
    { min: 11, max: 12, unit: "Heavy Aircraft", motive: "Aircraft" },
  ],
  C4: [
    { min: 1, max: 5, unit: "Assault Vehicle", motive: "Vehicle" },
    { min: 6, max: 9, unit: "Assault Walker", motive: "Walker" },
    { min: 10, max: 12, unit: "Assault Aircraft", motive: "Aircraft" },
  ],
};

const STRATEGIC_ASSET_TABLE = [
  { min: 1, max: 1, asset: "Airstrike F2", desc: "Airstrike with Firepower 2" },
  { min: 2, max: 2, asset: "Airstrike F4", desc: "Airstrike with Firepower 4" },
  { min: 3, max: 3, asset: "Airstrike F6", desc: "Airstrike with Firepower 6" },
  { min: 4, max: 4, asset: "Black Ice", desc: "Player discards 1 Interference Token" },
  { min: 5, max: 5, asset: "Surgical Strike", desc: "+3F to all AI vs target for 1 turn" },
  { min: 6, max: 7, asset: "Heavy Artillery", desc: "Auto-hit: F3 center, F2 at 1-3\", F1 at 4-6\"" },
  { min: 8, max: 8, asset: "Sabotage", desc: "Critical Hit vs triggering element" },
  { min: 9, max: 10, asset: "Repair Team", desc: "Recover 2 Damage Bar boxes on nearest damaged AI" },
  { min: 11, max: 12, asset: "Reinforcements", desc: "Free spawn ignoring FC cap" },
];

const EW_COST_TABLE = [
  { min: 1, max: 4, tokens: 0 },
  { min: 5, max: 7, tokens: 1 },
  { min: 8, max: 11, tokens: 2 },
  { min: 12, max: 12, tokens: 3 },
];

const DIRECTION_LABELS = [
  "Toward deployment", "Forward-right", "Right", "Back-right",
  "Back-right (wide)", "Away from deployment", "Away from deployment",
  "Back-left (wide)", "Back-left", "Left", "Forward-left", "Toward deployment (wide)",
];

function lookup<T extends { min: number; max: number }>(table: T[], roll: number): T | undefined {
  return table.find((entry) => roll >= entry.min && roll <= entry.max);
}

export interface SpawnCheckResult {
  triggered: boolean;
  roll: number;
  turn: number;
  total: number;
  reason: string;
  steps: string[];
}

export function spawnCheck(turn: number, aiFcSpent: number, aiFcTotal: number): SpawnCheckResult {
  if (aiFcSpent >= aiFcTotal) {
    return {
      triggered: false, roll: 0, turn, total: 0,
      reason: "AI FC exhausted — no more spawns.",
      steps: ["AI Force Class budget exhausted. No spawn check needed."],
    };
  }

  const roll = rollD12();
  const total = roll + turn;
  const triggered = total >= SPAWN_THRESHOLD;

  return {
    triggered, roll, turn, total,
    reason: triggered ? `${total} ≥ ${SPAWN_THRESHOLD} — Spawn triggered!` : `${total} < ${SPAWN_THRESHOLD} — No spawn.`,
    steps: [
      `Roll D12: ${roll}`,
      `Add turn number: ${roll} + ${turn} = ${total}`,
      `Threshold: ${SPAWN_THRESHOLD}`,
      triggered ? `${total} ≥ ${SPAWN_THRESHOLD} → SPAWN TRIGGERED` : `${total} < ${SPAWN_THRESHOLD} → No spawn`,
    ],
  };
}

export interface SpawnResolveResult {
  spawn_class: string;
  class_roll: number;
  unit_type: string;
  motive: string;
  subtable_roll: number;
  spotting: { spotted: boolean; rolls: number[]; highest: number; d_stat: number };
  direction: { direction_roll: number; direction_label: string; distance: number; distance_roll: number };
  fc_cost: number;
  steps: string[];
}

export function spawnResolve(playerDStat: number): SpawnResolveResult {
  const steps: string[] = [];

  // Class roll
  const classRoll = rollD12();
  const classEntry = lookup(SPAWN_CLASS_TABLE, classRoll);
  const spawnClass = classEntry?.result ?? "C1";
  steps.push(`Spawn Class D12: ${classRoll} → ${spawnClass}`);

  if (spawnClass === "strategic_asset") {
    return {
      spawn_class: "strategic_asset", class_roll: classRoll,
      unit_type: "Strategic Asset", motive: "N/A", subtable_roll: 0,
      spotting: { spotted: false, rolls: [], highest: 0, d_stat: playerDStat },
      direction: { direction_roll: 0, direction_label: "N/A", distance: 0, distance_roll: 0 },
      fc_cost: 0, steps,
    };
  }

  // Subtable roll
  const subtableRoll = rollD12();
  const subtable = SPAWN_SUBTABLES[spawnClass] ?? SPAWN_SUBTABLES.C1;
  const unitEntry = lookup(subtable, subtableRoll);
  const unitType = unitEntry?.unit ?? "Unknown";
  const motive = unitEntry?.motive ?? "Unknown";
  steps.push(`Unit Type D12: ${subtableRoll} → ${unitType} (${motive})`);

  const classNum = parseInt(spawnClass.replace("C", ""));
  const fcCost = classNum;

  // Spotting check
  const spottingRolls = rollMultipleD12(playerDStat);
  const highest = Math.max(...spottingRolls, 0);
  const spotted = spottingRolls.some((r) => r >= 11);
  steps.push(`Spotting Check: ${playerDStat}D12 = [${spottingRolls.join(", ")}] → ${spotted ? "SPOTTED (to pool)" : "UNSPOTTED (place now)"}`);

  // Direction & distance (only if not spotted)
  let dirRoll = 0, dirLabel = "N/A", distRoll = 0, distance = 0;
  if (!spotted) {
    dirRoll = rollD12();
    dirLabel = DIRECTION_LABELS[dirRoll - 1] ?? "Unknown";
    distRoll = rollD12();
    distance = distRoll + 4;
    steps.push(`Direction D12: ${dirRoll} → ${dirLabel}`);
    steps.push(`Distance D12: ${distRoll} + 4 = ${distance}"`);
    steps.push(`Placement: min 1" from AI, 5" from player elements`);
  }

  return {
    spawn_class: spawnClass, class_roll: classRoll,
    unit_type: unitType, motive, subtable_roll: subtableRoll,
    spotting: { spotted, rolls: spottingRolls, highest, d_stat: playerDStat },
    direction: { direction_roll: dirRoll, direction_label: dirLabel, distance, distance_roll: distRoll },
    fc_cost: fcCost, steps,
  };
}

export interface StrategicAssetResult {
  roll: number;
  asset: string;
  description: string;
  ew_roll: number;
  ew_tokens_cost: number;
  ew_pool_remaining: number;
  steps: string[];
}

export function resolveStrategicAsset(aiInterferencePool: number): StrategicAssetResult {
  const roll = rollD12();
  const entry = lookup(STRATEGIC_ASSET_TABLE, roll);
  const asset = entry?.asset ?? "Unknown";
  const description = entry?.desc ?? "";

  const ewRoll = rollD12();
  const ewEntry = lookup(EW_COST_TABLE, ewRoll);
  const tokensCost = Math.min(ewEntry?.tokens ?? 0, aiInterferencePool);
  const remaining = aiInterferencePool - tokensCost;

  return {
    roll, asset, description, ew_roll: ewRoll,
    ew_tokens_cost: tokensCost, ew_pool_remaining: remaining,
    steps: [
      `Strategic Asset D12: ${roll} → ${asset}`,
      `${description}`,
      `EW Token Cost D12: ${ewRoll} → ${tokensCost} token(s)`,
      `Interference Pool: ${aiInterferencePool} - ${tokensCost} = ${remaining}`,
    ],
  };
}

export interface EWResolveResult {
  roll: number;
  tokens_used: number;
  pool_remaining: number;
  steps: string[];
}

export function resolveEW(aiInterferencePool: number): EWResolveResult {
  const roll = rollD12();
  const entry = lookup(EW_COST_TABLE, roll);
  const tokensUsed = Math.min(entry?.tokens ?? 0, aiInterferencePool);
  const remaining = aiInterferencePool - tokensUsed;

  return {
    roll, tokens_used: tokensUsed, pool_remaining: remaining,
    steps: [
      `EW Roll D12: ${roll}`,
      `Token usage: ${tokensUsed}`,
      `Pool: ${aiInterferencePool} - ${tokensUsed} = ${remaining}`,
    ],
  };
}

export const AI_FC_BY_MISSION: Record<string, number> = {
  M0: 100, M1: 100, M2: 120, M3: 120, M4: 120,
  M5: 150, M6: 100, M7: 120, M8: 120, M9: 100,
  M10: 150, M11: 120, M12: 100,
};
