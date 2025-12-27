import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphStateService } from '../services/GraphStateService';
import type { IEventBus, INodeRepository } from '../interfaces';

const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(() => () => {}),
  off: vi.fn(),
});

const createMockNodeRepository = (): INodeRepository => ({
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getNode: vi.fn(),
  getNodeIds: vi.fn(() => []),
  getConnectedNodeIds: vi.fn(() => ({ incoming: new Set<string>(), outgoing: new Set<string>() })),
  getNodePosition: vi.fn(() => null),
  getNodePositions: vi.fn(() => ({})),
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

describe('GraphStateService', () => {
  let service: GraphStateService;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockNodeRepository: ReturnType<typeof createMockNodeRepository>;

  beforeEach(() => {
    mockEventBus = createMockEventBus();
    mockNodeRepository = createMockNodeRepository();
    service = new GraphStateService(mockEventBus, mockNodeRepository);
  });

  describe('initial state', () => {
    it('has null focusedNodeId', () => {
      expect(service.getFocusedNodeId()).toBeNull();
    });

    it('has null selectedNodeId', () => {
      expect(service.getSelectedNodeId()).toBeNull();
    });

    it('has empty activeNodeIds', () => {
      expect(service.getActiveNodeIds().size).toBe(0);
    });

    it('has empty incomingNodeIds', () => {
      expect(service.getIncomingNodeIds().size).toBe(0);
    });

    it('has empty outgoingNodeIds', () => {
      expect(service.getOutgoingNodeIds().size).toBe(0);
    });

    it('has empty phantomNodeIds', () => {
      expect(service.getPhantomNodeIds().size).toBe(0);
    });
  });

  describe('setFocusedNode', () => {
    it('sets focused node', () => {
      service.setFocusedNode('node1');
      expect(service.getFocusedNodeId()).toBe('node1');
    });

    it('emits focusChanged event', () => {
      service.setFocusedNode('node1');
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:focusChanged', {
        prev: null,
        current: 'node1',
      });
    });

    it('emits with previous value', () => {
      service.setFocusedNode('node1');
      service.setFocusedNode('node2');
      expect(mockEventBus.emit).toHaveBeenLastCalledWith('graphState:focusChanged', {
        prev: 'node1',
        current: 'node2',
      });
    });

    it('can set to null', () => {
      service.setFocusedNode('node1');
      service.setFocusedNode(null);
      expect(service.getFocusedNodeId()).toBeNull();
    });
  });

  describe('selectNode', () => {
    it('sets selected node', () => {
      service.selectNode('node1');
      expect(service.getSelectedNodeId()).toBe('node1');
    });

    it('replaces previously selected node', () => {
      service.selectNode('node1');
      service.selectNode('node2');
      expect(service.getSelectedNodeId()).toBe('node2');
    });

    it('emits selectionChanged event', () => {
      service.selectNode('node1');
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:selectionChanged', {
        selectedNodeId: 'node1',
      });
    });

    it('updates incoming and outgoing nodes from nodeRepository', () => {
      (mockNodeRepository.getConnectedNodeIds as ReturnType<typeof vi.fn>).mockReturnValue({
        incoming: new Set(['a', 'b']),
        outgoing: new Set(['c', 'd']),
      });

      service.selectNode('node1');

      expect(service.getIncomingNodeIds()).toEqual(new Set(['a', 'b']));
      expect(service.getOutgoingNodeIds()).toEqual(new Set(['c', 'd']));
    });
  });

  describe('unselectNode', () => {
    it('clears selected node', () => {
      service.selectNode('node1');
      service.unselectNode();
      expect(service.getSelectedNodeId()).toBeNull();
    });

    it('emits selectionChanged event', () => {
      service.selectNode('node1');
      vi.clearAllMocks();
      service.unselectNode();
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:selectionChanged', {
        selectedNodeId: null,
      });
    });

    it('clears incoming and outgoing nodes', () => {
      (mockNodeRepository.getConnectedNodeIds as ReturnType<typeof vi.fn>).mockReturnValue({
        incoming: new Set(['a', 'b']),
        outgoing: new Set(['c', 'd']),
      });

      service.selectNode('node1');
      service.unselectNode();

      expect(service.getIncomingNodeIds().size).toBe(0);
      expect(service.getOutgoingNodeIds().size).toBe(0);
    });
  });

  describe('setActiveNodes', () => {
    it('sets active nodes', () => {
      const nodes = new Set(['node1', 'node2']);
      service.setActiveNodes(nodes);
      expect(service.getActiveNodeIds()).toEqual(nodes);
    });

    it('emits activeNodesChanged event', () => {
      const nodes = new Set(['node1']);
      service.setActiveNodes(nodes);
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:activeNodesChanged', {
        activeNodeIds: nodes,
      });
    });
  });

  describe('setPhantomNodes', () => {
    it('sets phantom nodes', () => {
      const nodes = new Set(['phantom1', 'phantom2']);
      service.setPhantomNodes(nodes);
      expect(service.getPhantomNodeIds()).toEqual(nodes);
    });

    it('emits phantomNodesChanged event', () => {
      const nodes = new Set(['phantom1']);
      service.setPhantomNodes(nodes);
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:phantomNodesChanged', {
        phantomNodeIds: nodes,
      });
    });
  });

  describe('getConnectedNodeIds', () => {
    it('returns combined incoming and outgoing nodes', () => {
      (mockNodeRepository.getConnectedNodeIds as ReturnType<typeof vi.fn>).mockReturnValue({
        incoming: new Set(['a', 'b']),
        outgoing: new Set(['c', 'd']),
      });

      service.selectNode('node1');

      const connected = service.getConnectedNodeIds();
      expect(connected).toEqual(new Set(['a', 'b', 'c', 'd']));
    });

    it('returns empty set when no selection', () => {
      expect(service.getConnectedNodeIds().size).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets all state', () => {
      service.setFocusedNode('node1');
      service.selectNode('node2');
      service.setActiveNodes(new Set(['node3']));
      service.setPhantomNodes(new Set(['phantom1']));

      service.reset();

      expect(service.getFocusedNodeId()).toBeNull();
      expect(service.getSelectedNodeId()).toBeNull();
      expect(service.getActiveNodeIds().size).toBe(0);
      expect(service.getPhantomNodeIds().size).toBe(0);
    });

    it('emits reset event', () => {
      service.reset();
      expect(mockEventBus.emit).toHaveBeenCalledWith('graphState:reset', {});
    });
  });

  describe('subscribe', () => {
    it('calls listener on state change', () => {
      const listener = vi.fn();
      service.subscribe(listener);

      service.setFocusedNode('node1');

      expect(listener).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = service.subscribe(listener);

      unsubscribe();
      service.setFocusedNode('node1');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getState', () => {
    it('returns full state', () => {
      service.setFocusedNode('node1');
      service.selectNode('node2');

      const state = service.getState();

      expect(state.focusedNodeId).toBe('node1');
      expect(state.selectedNodeId).toBe('node2');
    });
  });
});
