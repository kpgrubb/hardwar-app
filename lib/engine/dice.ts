export function rollD12(): number {
  return Math.floor(Math.random() * 12) + 1;
}

export function rollMultipleD12(count: number): number[] {
  return Array.from({ length: count }, () => rollD12());
}
