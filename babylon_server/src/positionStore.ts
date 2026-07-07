const positions = new Map<string, { x: number; y: number; z: number }>();

export function setPosition(ckey: string, x: number, y: number, z: number): void {
	positions.set(ckey, { x, y, z });
}

export function removePosition(ckey: string): void {
	positions.delete(ckey);
}

export function getPositions(): { ckey: string; x: number; y: number; z: number }[] {
	return Array.from(positions.entries()).map(([ckey, pos]) => ({ ckey, ...pos }));
}
