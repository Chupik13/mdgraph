import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navigator } from '../services/Navigator';
import type { IGraphStateService, GraphState, INodeRepository } from '../interfaces';
import type { Position } from '../../infrastructure/vis-network/types';

const createMockGraphState = (state: Partial<GraphState> = {}): IGraphStateService => ({
  getState: vi.fn(() => ({
    focusedNodeId: null,
    selectedNodeId: null,
    activeNodeIds: new Set<string>(),
    incomingNodeIds: new Set<string>(),
    outgoingNodeIds: new Set<string>(),
    phantomNodeIds: new Set<string>(),
    ...state,
  })),
  getFocusedNodeId: vi.fn(() => state.focusedNodeId ?? null),
  getSelectedNodeId: vi.fn(() => state.selectedNodeId ?? null),
  getActiveNodeIds: vi.fn((): Set<string> => state.activeNodeIds ?? new Set<string>()),
  getIncomingNodeIds: vi.fn((): Set<string> => state.incomingNodeIds ?? new Set<string>()),
  getOutgoingNodeIds: vi.fn((): Set<string> => state.outgoingNodeIds ?? new Set<string>()),
  getConnectedNodeIds: vi.fn((): Set<string> => new Set([...(state.incomingNodeIds ?? []), ...(state.outgoingNodeIds ?? [])])),
  getPhantomNodeIds: vi.fn((): Set<string> => state.phantomNodeIds ?? new Set<string>()),
  setFocusedNode: vi.fn(),
  selectNode: vi.fn(),
  unselectNode: vi.fn(),
  setActiveNodes: vi.fn(),
  setPhantomNodes: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  reset: vi.fn(),
});

const createMockNodeRepository = (positions: Record<string, Position> = {}): INodeRepository => ({
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getNode: vi.fn(),
  getNodeIds: vi.fn(() => []),
  getConnectedNodeIds: vi.fn(() => ({ incoming: new Set<string>(), outgoing: new Set<string>() })),
  getNodePosition: vi.fn((nodeId: string) => positions[nodeId] ?? null),
  getNodePositions: vi.fn((nodeIds: string[]) => {
    const result: Record<string, Position> = {};
    for (const id of nodeIds) {
      if (positions[id]) {
        result[id] = positions[id];
      }
    }
    return result;
  }),
  getRandomNode: vi.fn(() => null),
  isPhantom: vi.fn(() => false),
  isReady: vi.fn(() => true),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  addEdge: vi.fn(),
  removeEdge: vi.fn(),
  setGraphData: vi.fn(),
  clear: vi.fn(),
  initialize: vi.fn(),
  destroy: vi.fn(),
});

describe('Navigator', () => {
  let navigator: Navigator;
  let mockGraphState: ReturnType<typeof createMockGraphState>;
  let mockNodeRepository: ReturnType<typeof createMockNodeRepository>;

  beforeEach(() => {
    mockGraphState = createMockGraphState();
    mockNodeRepository = createMockNodeRepository();
    navigator = new Navigator(mockGraphState, mockNodeRepository);
  });

  describe('without data', () => {
    it('toUp does not throw', () => {
      expect(() => navigator.toUp()).not.toThrow();
    });

    it('toDown does not throw', () => {
      expect(() => navigator.toDown()).not.toThrow();
    });

    it('toLeft does not throw', () => {
      expect(() => navigator.toLeft()).not.toThrow();
    });

    it('toRight does not throw', () => {
      expect(() => navigator.toRight()).not.toThrow();
    });

    it('toClockwiseConnected does not throw', () => {
      expect(() => navigator.toClockwiseConnected()).not.toThrow();
    });

    it('toClockwiseActive does not throw', () => {
      expect(() => navigator.toClockwiseActive()).not.toThrow();
    });
  });

  describe('directional navigation', () => {
    it('toUp selects nearest node above from activeNodeIds', () => {
      const positions = {
        focused: { x: 100, y: 100 },
        above1: { x: 100, y: 50 },
        above2: { x: 100, y: 20 },
        below: { x: 100, y: 150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(['above1', 'above2', 'below']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toUp();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('above1');
    });

    it('toDown selects nearest node below from activeNodeIds', () => {
      const positions = {
        focused: { x: 100, y: 100 },
        below1: { x: 100, y: 150 },
        below2: { x: 100, y: 200 },
        above: { x: 100, y: 50 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(['below1', 'below2', 'above']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toDown();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('below1');
    });

    it('toLeft selects nearest node to the left from activeNodeIds', () => {
      const positions = {
        focused: { x: 100, y: 100 },
        left1: { x: 50, y: 100 },
        left2: { x: 20, y: 100 },
        right: { x: 150, y: 100 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(['left1', 'left2', 'right']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toLeft();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('left1');
    });

    it('toRight selects nearest node to the right from activeNodeIds', () => {
      const positions = {
        focused: { x: 100, y: 100 },
        right1: { x: 150, y: 100 },
        right2: { x: 200, y: 100 },
        left: { x: 50, y: 100 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(['right1', 'right2', 'left']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toRight();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('right1');
    });

    it('does nothing when no nodes in direction', () => {
      const positions = {
        focused: { x: 100, y: 100 },
        below: { x: 100, y: 150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(['below']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toUp();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });

    it('does nothing when activeNodeIds is empty', () => {
      const positions = { focused: { x: 100, y: 100 } };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'focused',
        activeNodeIds: new Set(),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toUp();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });

    it('does nothing when no focused node', () => {
      const positions = {
        a: { x: 100, y: 50 },
        b: { x: 100, y: 150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: null,
        activeNodeIds: new Set(['a', 'b']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toUp();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });
  });

  describe('clockwise connected navigation', () => {
    it('navigates clockwise through connected nodes', () => {
      // Nodes arranged around selected at center (100, 100)
      // Angles: right=0, down=π/2, left=π, up=-π/2
      const positions = {
        selected: { x: 100, y: 100 },
        right: { x: 150, y: 100 },   // angle ≈ 0
        down: { x: 100, y: 150 },    // angle ≈ π/2
        left: { x: 50, y: 100 },     // angle ≈ π
        up: { x: 100, y: 50 },       // angle ≈ -π/2
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'right',
        selectedNodeId: 'selected',
        incomingNodeIds: new Set(['up', 'left']),
        outgoingNodeIds: new Set(['right', 'down']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseConnected();

      // After right (angle 0), next clockwise is down (angle π/2)
      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('down');
    });

    it('navigates counterclockwise through connected nodes', () => {
      const positions = {
        selected: { x: 100, y: 100 },
        right: { x: 150, y: 100 },
        down: { x: 100, y: 150 },
        left: { x: 50, y: 100 },
        up: { x: 100, y: 50 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'down',
        selectedNodeId: 'selected',
        incomingNodeIds: new Set(['up', 'left']),
        outgoingNodeIds: new Set(['right', 'down']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toCounterClockwiseConnected();

      // Before down (angle π/2), counterclockwise is right (angle 0)
      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('right');
    });

    it('does nothing when no selected nodes', () => {
      const positions = {
        a: { x: 100, y: 50 },
        b: { x: 100, y: 150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'a',
        selectedNodeId: null,
        incomingNodeIds: new Set(['a']),
        outgoingNodeIds: new Set(['b']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseConnected();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });

    it('does nothing when no connected nodes', () => {
      const positions = {
        selected: { x: 100, y: 100 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: null,
        selectedNodeId: 'selected',
        incomingNodeIds: new Set(),
        outgoingNodeIds: new Set(),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseConnected();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });
  });

  describe('clockwise active navigation', () => {
    it('navigates clockwise through active nodes around center', () => {
      // Nodes around center (0,0): right=0°, down=90°, left=180°, up=-90°
      const positions = {
        right: { x: 150, y: 0 },
        down: { x: 0, y: 150 },
        left: { x: -150, y: 0 },
        up: { x: 0, y: -150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'right',
        activeNodeIds: new Set(['right', 'down', 'left', 'up']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseActive();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('down');
    });

    it('navigates counterclockwise through active nodes around center', () => {
      const positions = {
        right: { x: 150, y: 0 },
        down: { x: 0, y: 150 },
        left: { x: -150, y: 0 },
        up: { x: 0, y: -150 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: 'down',
        activeNodeIds: new Set(['right', 'down', 'left', 'up']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toCounterClockwiseActive();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalledWith('right');
    });

    it('selects first node when no current focus', () => {
      const positions = {
        a: { x: 100, y: 0 },
        b: { x: 0, y: 100 },
      };
      mockNodeRepository = createMockNodeRepository(positions);
      mockGraphState = createMockGraphState({
        focusedNodeId: null,
        activeNodeIds: new Set(['a', 'b']),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseActive();

      expect(mockGraphState.setFocusedNode).toHaveBeenCalled();
    });

    it('does nothing when activeNodeIds is empty', () => {
      mockNodeRepository = createMockNodeRepository({});
      mockGraphState = createMockGraphState({
        focusedNodeId: null,
        activeNodeIds: new Set(),
      });
      navigator = new Navigator(mockGraphState, mockNodeRepository);

      navigator.toClockwiseActive();

      expect(mockGraphState.setFocusedNode).not.toHaveBeenCalled();
    });
  });
});
