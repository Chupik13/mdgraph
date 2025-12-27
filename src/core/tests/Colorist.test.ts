import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Colorist } from '../services/Colorist';
import type { IEventBus, IGraphStateService, GraphState } from '../interfaces';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { VisNode } from '../../infrastructure/vis-network/types';

const createMockEventBus = () => {
  const listeners: Map<string, Set<() => void>> = new Map();
  return {
    emit: vi.fn((event: string) => {
      const handlers = listeners.get(event);
      if (handlers) {
        handlers.forEach((h) => h());
      }
    }),
    on: vi.fn((event: string, handler: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
      return () => {
        listeners.get(event)?.delete(handler);
      };
    }),
    off: vi.fn(),
  } as unknown as IEventBus;
};

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

const createMockAdapter = (nodes: VisNode[] = []) => ({
  getNodes: vi.fn(() => nodes),
  getNode: vi.fn((id: string) => nodes.find((n) => n.id === id) ?? null),
  updateNodes: vi.fn(),
  initialize: vi.fn(),
  destroy: vi.fn(),
});

describe('Colorist', () => {
  let colorist: Colorist;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockGraphState: ReturnType<typeof createMockGraphState>;
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    mockEventBus = createMockEventBus();
    mockGraphState = createMockGraphState();
    mockAdapter = createMockAdapter();
    colorist = new Colorist(mockEventBus, mockGraphState);
  });

  describe('initialize', () => {
    it('subscribes to events', () => {
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockEventBus.on).toHaveBeenCalledWith('graphState:selectionChanged', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('graphState:phantomNodesChanged', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('graphState:reset', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('nodeRepository:dataChanged', expect.any(Function));
    });

    it('calls applyColors on initialize', () => {
      const nodes: VisNode[] = [{ id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] }];
      mockAdapter = createMockAdapter(nodes);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
    });
  });

  describe('applyColors (full)', () => {
    it('does nothing without adapter', () => {
      colorist.applyColors();
      // Should not throw
    });

    it('does nothing when no nodes', () => {
      mockAdapter = createMockAdapter([]);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);
      mockAdapter.updateNodes.mockClear();

      colorist.applyColors();

      expect(mockAdapter.updateNodes).not.toHaveBeenCalled();
    });

    it('colors regular nodes with regular color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#383961', border: '#2e2e4f' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('colors selected nodes with selected color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ selectedNodeId: 'a' });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#45b592', border: '#72f0c2' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('colors outgoing nodes with outgoing color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ outgoingNodeIds: new Set(['a']) });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#db172f', border: '#ab1125' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('colors incoming nodes with incoming color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ incomingNodeIds: new Set(['a']) });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#dbdfac', border: '#adb088' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('colors phantom nodes with phantom color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: 'phantom', file_path: '', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#3b1f2b', border: '#3b1f2b' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('colors nodes in phantomNodeIds with phantom color', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ phantomNodeIds: new Set(['a']) });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#3b1f2b', border: '#3b1f2b' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('selected has higher priority than outgoing', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({
        selectedNodeId: 'a',
        outgoingNodeIds: new Set(['a']),
      });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#45b592', border: '#72f0c2' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('outgoing has higher priority than incoming', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({
        outgoingNodeIds: new Set(['a']),
        incomingNodeIds: new Set(['a']),
      });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#db172f', border: '#ab1125' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('incoming has higher priority than phantom', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: 'phantom', file_path: '', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({
        incomingNodeIds: new Set(['a']),
      });
      colorist = new Colorist(mockEventBus, mockGraphState);

      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#dbdfac', border: '#adb088' }, borderDashes: false, borderWidth: 1 },
      ]);
    });
  });

  describe('setColorScheme', () => {
    it('updates colors and reapplies', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);
      mockAdapter.updateNodes.mockClear();

      colorist.setColorScheme({
        regular: { border: '#000', background: '#111' },
      });

      expect(mockAdapter.updateNodes).toHaveBeenCalledWith([
        { id: 'a', color: { background: '#111', border: '#000' }, borderDashes: false, borderWidth: 1 },
      ]);
    });

    it('merges with existing colors', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: 'phantom', file_path: '', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);
      mockAdapter.updateNodes.mockClear();

      colorist.setColorScheme({
        regular: { border: '#000', background: '#111' },
      });

      const calls = mockAdapter.updateNodes.mock.calls[0][0];
      const regularNode = calls.find((n: { id: string }) => n.id === 'a');
      const phantomNode = calls.find((n: { id: string }) => n.id === 'b');

      expect(regularNode.color).toEqual({ background: '#111', border: '#000' });
      expect(phantomNode.color).toEqual({ background: '#3b1f2b', border: '#3b1f2b' });
    });
  });

  describe('destroy', () => {
    it('unsubscribes from events', () => {
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      colorist.destroy();

      // After destroy, applyColors should not be called on events
      mockAdapter.updateNodes.mockClear();
      mockEventBus.emit('graphState:selectionChanged', {});

      expect(mockAdapter.updateNodes).not.toHaveBeenCalled();
    });
  });

  describe('incremental updates (applyColorsDiff)', () => {
    it('updates only changed nodes on selectionChanged', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: null, file_path: '/b.md', hashtags: [] },
        { id: 'c', label: 'C', value: 1, group: null, file_path: '/c.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      // Initial state: all regular
      mockAdapter.updateNodes.mockClear();

      // Now select node 'a'
      (mockGraphState.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        focusedNodeId: null,
        selectedNodeId: 'a',
        activeNodeIds: new Set(),
        incomingNodeIds: new Set(),
        outgoingNodeIds: new Set(),
        phantomNodeIds: new Set(),
      });

      mockEventBus.emit('graphState:selectionChanged', {});

      // Should only update 'a', not 'b' and 'c'
      expect(mockAdapter.updateNodes).toHaveBeenCalledTimes(1);
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      expect(updates).toHaveLength(1);
      expect(updates[0].id).toBe('a');
      expect(updates[0].color).toEqual({ background: '#45b592', border: '#72f0c2' });
    });

    it('updates both deselected and newly selected nodes', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: null, file_path: '/b.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ selectedNodeId: 'a' });
      colorist = new Colorist(mockEventBus, mockGraphState);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      // Change selection from 'a' to 'b'
      (mockGraphState.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        focusedNodeId: null,
        selectedNodeId: 'b',
        activeNodeIds: new Set(),
        incomingNodeIds: new Set(),
        outgoingNodeIds: new Set(),
        phantomNodeIds: new Set(),
      });

      mockEventBus.emit('graphState:selectionChanged', {});

      // Should update both 'a' (now regular) and 'b' (now selected)
      expect(mockAdapter.updateNodes).toHaveBeenCalledTimes(1);
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      expect(updates).toHaveLength(2);

      const nodeA = updates.find((u: { id: string }) => u.id === 'a');
      const nodeB = updates.find((u: { id: string }) => u.id === 'b');

      expect(nodeA.color).toEqual({ background: '#383961', border: '#2e2e4f' }); // regular
      expect(nodeB.color).toEqual({ background: '#45b592', border: '#72f0c2' }); // selected
    });

    it('does not call updateNodes when nothing changed', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ selectedNodeId: 'a' });
      colorist = new Colorist(mockEventBus, mockGraphState);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      // Emit event but state hasn't changed
      mockEventBus.emit('graphState:selectionChanged', {});

      expect(mockAdapter.updateNodes).not.toHaveBeenCalled();
    });

    it('updates incoming and outgoing nodes incrementally', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: null, file_path: '/b.md', hashtags: [] },
        { id: 'c', label: 'C', value: 1, group: null, file_path: '/c.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      // Select 'a' with incoming 'b' and outgoing 'c'
      (mockGraphState.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        focusedNodeId: null,
        selectedNodeId: 'a',
        activeNodeIds: new Set(),
        incomingNodeIds: new Set(['b']),
        outgoingNodeIds: new Set(['c']),
        phantomNodeIds: new Set(),
      });

      mockEventBus.emit('graphState:selectionChanged', {});

      expect(mockAdapter.updateNodes).toHaveBeenCalledTimes(1);
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      expect(updates).toHaveLength(3);

      const nodeA = updates.find((u: { id: string }) => u.id === 'a');
      const nodeB = updates.find((u: { id: string }) => u.id === 'b');
      const nodeC = updates.find((u: { id: string }) => u.id === 'c');

      expect(nodeA.color).toEqual({ background: '#45b592', border: '#72f0c2' }); // selected
      expect(nodeB.color).toEqual({ background: '#dbdfac', border: '#adb088' }); // incoming
      expect(nodeC.color).toEqual({ background: '#db172f', border: '#ab1125' }); // outgoing
    });
  });

  describe('full recolor events', () => {
    it('recolors all on reset event', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: null, file_path: '/b.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      mockGraphState = createMockGraphState({ selectedNodeId: 'a' });
      colorist = new Colorist(mockEventBus, mockGraphState);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      // Reset clears selection
      (mockGraphState.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        focusedNodeId: null,
        selectedNodeId: null,
        activeNodeIds: new Set(),
        incomingNodeIds: new Set(),
        outgoingNodeIds: new Set(),
        phantomNodeIds: new Set(),
      });

      mockEventBus.emit('graphState:reset', {});

      // Should update ALL nodes (full recolor)
      expect(mockAdapter.updateNodes).toHaveBeenCalledTimes(1);
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      expect(updates).toHaveLength(2);
    });

    it('recolors all on dataChanged event', () => {
      const nodes: VisNode[] = [
        { id: 'a', label: 'A', value: 1, group: null, file_path: '/a.md', hashtags: [] },
        { id: 'b', label: 'B', value: 1, group: null, file_path: '/b.md', hashtags: [] },
      ];
      mockAdapter = createMockAdapter(nodes);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      mockEventBus.emit('nodeRepository:dataChanged', {});

      // Should update ALL nodes (full recolor)
      expect(mockAdapter.updateNodes).toHaveBeenCalledTimes(1);
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      expect(updates).toHaveLength(2);
    });
  });
});
