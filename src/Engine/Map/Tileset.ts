export interface Tile {
  index: number;
  mirrored: number;
  inverted: number;
}

export interface Tileset {
  drawTile(
    target: Surface | null,
    highPriorityTarget: Surface | null,
    index: number,
    x: number,
    y: number,
    renderDynamic?: boolean
  ): void;
  isDynamicTile(index: number): boolean;
  // getDynamicTileSpeed(index: number): number | null;
}
