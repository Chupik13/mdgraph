import type { INavigator, IGraphStateService, Position, INodeRepository } from '../interfaces';

type Direction = 'up' | 'down' | 'left' | 'right';

export class Navigator implements INavigator {

  constructor(
    private graphState: IGraphStateService,
    private nodeRepository: INodeRepository
  ) {}

  toUp(): void {
    this.navigateDirection('up');
  }

  toDown(): void {
    this.navigateDirection('down');
  }

  toLeft(): void {
    this.navigateDirection('left');
  }

  toRight(): void {
    this.navigateDirection('right');
  }

  toClockwiseConnected(): void {
    this.navigateConnected(true);
  }

  toCounterClockwiseConnected(): void {
    this.navigateConnected(false);
  }

  toClockwiseActive(): void {
    this.navigateActive(true);
  }

  toCounterClockwiseActive(): void {
    this.navigateActive(false);
  }

  private navigateDirection(direction: Direction): void {
    console.log(`[Navigator] navigateDirection: ${direction}`);

    const focusedId = this.graphState.getFocusedNodeId()
      ?? this.nodeRepository.getRandomNode()?.id
      ?? null;
    console.log(`[Navigator] focusedId: ${focusedId}`);

    if (!focusedId) {
      console.log('[Navigator] EXIT: no focusedId');
      return;
    }

    const activeNodeIds = this.graphState.getActiveNodeIds();
    console.log(`[Navigator] activeNodeIds.size: ${activeNodeIds.size}`);
    if (activeNodeIds.size === 0) {
      console.log('[Navigator] EXIT: no active nodes');
      return;
    }

    const focusedPos = this.nodeRepository.getNodePosition(focusedId);
    console.log(`[Navigator] focusedPos:`, focusedPos);
    if (!focusedPos) {
      console.log('[Navigator] EXIT: no focusedPos');
      return;
    }

    const positions = this.nodeRepository.getNodePositions([...activeNodeIds]);
    console.log(`[Navigator] positions count: ${Object.keys(positions).length}`);

    const candidates = this.filterByDirection(
      activeNodeIds,
      positions,
      focusedPos,
      direction
    );
    console.log(`[Navigator] candidates: ${candidates.length}`);

    if (candidates.length === 0) {
      console.log('[Navigator] EXIT: no candidates in direction');
      return;
    }

    const nearest = this.findNearest(candidates, focusedPos);
    console.log(`[Navigator] nearest: ${nearest}`);
    if (nearest) {
      this.graphState.setFocusedNode(nearest);
      console.log(`[Navigator] SUCCESS: focused on ${nearest}`);
    }
  }

  private navigateConnected(clockwise: boolean): void {
    const selectedId = this.graphState.getSelectedNodeId();
    if (!selectedId) {
      return;
    }

    const connectedNodeIds = this.graphState.getConnectedNodeIds();
    if (connectedNodeIds.size === 0) {
      return;
    }

    const centerPos = this.nodeRepository.getNodePosition(selectedId);
    if (!centerPos) {
      return;
    }

    const positions = this.nodeRepository.getNodePositions([...connectedNodeIds]);

    const focusedId = this.graphState.getFocusedNodeId();
    const targetId = this.navigateCircular(
      [...connectedNodeIds],
      positions,
      centerPos,
      focusedId,
      clockwise
    );

    if (targetId) {
      this.graphState.setFocusedNode(targetId);
    }
  }

  private navigateActive(clockwise: boolean): void {
    const activeNodeIds = this.graphState.getActiveNodeIds();
    if (activeNodeIds.size === 0) {
      return;
    }

    const positions = this.nodeRepository.getNodePositions([...activeNodeIds]);
    const centerPos = this.calculateCenter(positions);
    if (!centerPos) {
      return;
    }

    const focusedId = this.graphState.getFocusedNodeId();
    const targetId = this.navigateCircular(
      [...activeNodeIds],
      positions,
      centerPos,
      focusedId,
      clockwise
    );

    if (targetId) {
      this.graphState.setFocusedNode(targetId);
    }
  }

  private calculateCenter(positions: Record<string, Position>): Position | null {
    const values = Object.values(positions);
    if (values.length === 0) {
      return null;
    }

    let sumX = 0;
    let sumY = 0;
    for (const pos of values) {
      sumX += pos.x;
      sumY += pos.y;
    }

    return {
      x: sumX / values.length,
      y: sumY / values.length,
    };
  }

  private navigateCircular(
    nodeIds: string[],
    positions: Record<string, Position>,
    center: Position,
    currentFocusedId: string | null,
    clockwise: boolean
  ): string | null {
    if (nodeIds.length === 0) {
      return null;
    }

    const nodesWithAngles = nodeIds
      .filter((id) => positions[id])
      .map((id) => ({
        id,
        angle: this.calculateAngle(center, positions[id]!),
      }));

    if (nodesWithAngles.length === 0) {
      return null;
    }

    nodesWithAngles.sort((a, b) => a.angle - b.angle);

    const currentIndex = currentFocusedId
      ? nodesWithAngles.findIndex((n) => n.id === currentFocusedId)
      : -1;

    let nextIndex: number;
    if (currentIndex === -1) {
      nextIndex = 0;
    } else if (clockwise) {
      nextIndex = (currentIndex + 1) % nodesWithAngles.length;
    } else {
      nextIndex = (currentIndex - 1 + nodesWithAngles.length) % nodesWithAngles.length;
    }

    return nodesWithAngles[nextIndex]?.id ?? null;
  }

  private calculateAngle(center: Position, point: Position): number {
    return Math.atan2(point.y - center.y, point.x - center.x);
  }

  private filterByDirection(
    nodeIds: Set<string>,
    positions: Record<string, Position>,
    focusedPos: Position,
    direction: Direction
  ): Array<{ id: string; pos: Position }> {
    const result: Array<{ id: string; pos: Position }> = [];

    for (const id of nodeIds) {
      const pos = positions[id];
      if (!pos) {
        continue;
      }

      let matches = false;
      switch (direction) {
        case 'up':
          matches = pos.y < focusedPos.y;
          break;
        case 'down':
          matches = pos.y > focusedPos.y;
          break;
        case 'left':
          matches = pos.x < focusedPos.x;
          break;
        case 'right':
          matches = pos.x > focusedPos.x;
          break;
      }

      if (matches) {
        result.push({ id, pos });
      }
    }

    return result;
  }

  private findNearest(
    candidates: Array<{ id: string; pos: Position }>,
    from: Position
  ): string | null {
    if (candidates.length === 0) {
      return null;
    }

    let nearest = candidates[0]!;
    let minDist = this.distanceSquared(from, nearest.pos);

    for (let i = 1; i < candidates.length; i++) {
      const candidate = candidates[i]!;
      const dist = this.distanceSquared(from, candidate.pos);
      if (dist < minDist) {
        minDist = dist;
        nearest = candidate;
      }
    }

    return nearest.id;
  }

  private distanceSquared(a: Position, b: Position): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }
}
