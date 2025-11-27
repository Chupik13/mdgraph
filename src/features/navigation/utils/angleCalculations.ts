/**
 * Angle calculation utilities for clockwise node navigation.
 *
 * This module provides functions for calculating angles between points
 * and sorting nodes by their angular position relative to a center point.
 *
 * @module features/navigation/utils/angleCalculations
 */

/**
 * Position in 2D coordinate space.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Calculates clockwise angle from center point to target point.
 *
 * Converts standard atan2 output (0° = east) to compass bearing (0° = north).
 *
 * @param from - Center reference point
 * @param to - Target point to calculate angle to
 * @returns Angle in degrees (0-360), where 0° = north, 90° = east
 *
 * @remarks
 * ## Coordinate System Transformation
 * - atan2(dy, dx) returns: 0° = right, 90° = down, -90° = up
 * - This function returns: 0° = up, 90° = right, 180° = down
 *
 * The transformation `(angle * 180 / π + 90 + 360) % 360`:
 * 1. Convert radians to degrees: `angle * 180 / π`
 * 2. Rotate +90° to make north = 0°: `+ 90`
 * 3. Normalize to 0-360 range: `+ 360) % 360`
 *
 * @example
 * // Node directly above center (north)
 * calculateClockwiseAngle({ x: 0, y: 0 }, { x: 0, y: -10 }); // → 0°
 *
 * // Node to the right (east)
 * calculateClockwiseAngle({ x: 0, y: 0 }, { x: 10, y: 0 }); // → 90°
 */
export function calculateClockwiseAngle(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  const degrees = (angle * 180) / Math.PI;
  return (degrees + 90 + 360) % 360;
}

/**
 * Sorts node IDs by their clockwise angle from a center point.
 *
 * @param nodeIds - Array of node IDs to sort
 * @param positions - Map of node IDs to their positions
 * @param center - Center point for angle calculation
 * @returns Array of node IDs sorted by clockwise angle (0° = north)
 *
 * @remarks
 * Nodes without position data are assigned angle 0 (treated as north).
 *
 * @example
 * const sorted = sortNodesByAngle(
 *   ['a', 'b', 'c'],
 *   { a: { x: 10, y: 0 }, b: { x: 0, y: -10 }, c: { x: -10, y: 0 } },
 *   { x: 0, y: 0 }
 * );
 * // Returns: ['b', 'a', 'c'] (north, east, west)
 */
export function sortNodesByAngle(
  nodeIds: string[],
  positions: Record<string, Position | undefined>,
  center: Position,
): string[] {
  const nodesWithAngles = nodeIds.map((nodeId) => {
    const pos = positions[nodeId];
    if (!pos) return { nodeId, angle: 0 };

    return {
      nodeId,
      angle: calculateClockwiseAngle(center, pos),
    };
  });

  nodesWithAngles.sort((a, b) => a.angle - b.angle);
  return nodesWithAngles.map((item) => item.nodeId);
}
