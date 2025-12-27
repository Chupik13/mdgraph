import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeRepository } from '../services/NodeRepository';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { Node, Edge } from '../../shared/types';
import type { IEventBus } from '../interfaces';

const createMockNode = (id: string, group: 'phantom' | null = null): Node => ({
  id,
  label: id,
  value: 1,
  group,
  file_path: group === 'phantom' ? '' : `/path/${id}.md`,
  hashtags: [],
});

const createMockAdapter = (positions: Record<string, { x: number; y: number }> = {}) => ({
  getNodes: vi.fn(),
  getEdges: vi.fn(),
  getNode: vi.fn(),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  addEdge: vi.fn(),
  removeEdge: vi.fn(),
  setData: vi.fn(),
  getPositions: vi.fn((nodeIds: string[]) => {
    const result: Record<string, { x: number; y: number }> = {};
    for (const id of nodeIds) {
      if (positions[id]) {
        result[id] = positions[id];
      }
    }
    return result;
  }),
});

const createMockEventBus = (): IEventBus => ({
  emit: vi.fn(),
  on: vi.fn(() => () => {}),
  off: vi.fn(),
});

describe('NodeRepository', () => {
  let repo: NodeRepository;
  let mockAdapter: ReturnType<typeof createMockAdapter>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;

  beforeEach(() => {
    mockEventBus = createMockEventBus();
    repo = new NodeRepository(mockEventBus);
    mockAdapter = createMockAdapter();
  });

  describe('isReady', () => {
    it('returns false before initialize', () => {
      expect(repo.isReady()).toBe(false);
    });

    it('returns true after initialize', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      expect(repo.isReady()).toBe(true);
    });

    it('returns false after destroy', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.destroy();
      expect(repo.isReady()).toBe(false);
    });
  });

  describe('getNodes', () => {
    it('returns empty array without adapter', () => {
      expect(repo.getNodes()).toEqual([]);
    });

    it('delegates to adapter', () => {
      const nodes = [createMockNode('a'), createMockNode('b')];
      mockAdapter.getNodes.mockReturnValue(nodes);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getNodes()).toEqual(nodes);
      expect(mockAdapter.getNodes).toHaveBeenCalled();
    });
  });

  describe('getEdges', () => {
    it('returns empty array without adapter', () => {
      expect(repo.getEdges()).toEqual([]);
    });

    it('delegates to adapter', () => {
      const edges: Edge[] = [{ from: 'a', to: 'b' }];
      mockAdapter.getEdges.mockReturnValue(edges);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getEdges()).toEqual(edges);
      expect(mockAdapter.getEdges).toHaveBeenCalled();
    });
  });

  describe('getNode', () => {
    it('returns undefined without adapter', () => {
      expect(repo.getNode('a')).toBeUndefined();
    });

    it('delegates to adapter', () => {
      const node = createMockNode('a');
      mockAdapter.getNode.mockReturnValue(node);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getNode('a')).toEqual(node);
      expect(mockAdapter.getNode).toHaveBeenCalledWith('a');
    });
  });

  describe('getNodeIds', () => {
    it('returns empty array without adapter', () => {
      expect(repo.getNodeIds()).toEqual([]);
    });

    it('returns array of node ids', () => {
      const nodes = [createMockNode('a'), createMockNode('b'), createMockNode('c')];
      mockAdapter.getNodes.mockReturnValue(nodes);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getNodeIds()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('getConnectedNodeIds', () => {
    it('returns empty sets without adapter', () => {
      const result = repo.getConnectedNodeIds('a');
      expect(result.incoming.size).toBe(0);
      expect(result.outgoing.size).toBe(0);
    });

    it('correctly computes incoming and outgoing connections', () => {
      const edges: Edge[] = [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'b' },
        { from: 'b', to: 'd' },
        { from: 'b', to: 'e' },
      ];
      mockAdapter.getEdges.mockReturnValue(edges);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      const result = repo.getConnectedNodeIds('b');

      expect(Array.from(result.incoming)).toEqual(['a', 'c']);
      expect(Array.from(result.outgoing)).toEqual(['d', 'e']);
    });
  });

  describe('isPhantom', () => {
    it('returns false for non-existent node', () => {
      mockAdapter.getNode.mockReturnValue(undefined);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.isPhantom('nonexistent')).toBe(false);
    });

    it('returns false for regular node', () => {
      const node = createMockNode('a', null);
      mockAdapter.getNode.mockReturnValue(node);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.isPhantom('a')).toBe(false);
    });

    it('returns true for phantom node', () => {
      const node = createMockNode('a', 'phantom');
      mockAdapter.getNode.mockReturnValue(node);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.isPhantom('a')).toBe(true);
    });
  });

  describe('addNode', () => {
    it('does nothing without adapter', () => {
      const node = createMockNode('a');
      repo.addNode(node);
      // No error thrown
    });

    it('delegates to adapter', () => {
      const node = createMockNode('a');
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.addNode(node);

      expect(mockAdapter.addNode).toHaveBeenCalledWith(node);
    });

    it('emits nodeAdded event', () => {
      const node = createMockNode('a');
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.addNode(node);

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:nodeAdded', { node });
    });
  });

  describe('removeNode', () => {
    it('does nothing without adapter', () => {
      repo.removeNode('a');
      // No error thrown
    });

    it('delegates to adapter', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.removeNode('a');

      expect(mockAdapter.removeNode).toHaveBeenCalledWith('a');
    });

    it('emits nodeRemoved event', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.removeNode('a');

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:nodeRemoved', { nodeId: 'a' });
    });
  });

  describe('addEdge', () => {
    it('does nothing without adapter', () => {
      repo.addEdge({ from: 'a', to: 'b' });
      // No error thrown
    });

    it('delegates to adapter', () => {
      const edge: Edge = { from: 'a', to: 'b' };
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.addEdge(edge);

      expect(mockAdapter.addEdge).toHaveBeenCalledWith(edge);
    });

    it('emits edgeAdded event', () => {
      const edge: Edge = { from: 'a', to: 'b' };
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.addEdge(edge);

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:edgeAdded', { edge });
    });
  });

  describe('removeEdge', () => {
    it('does nothing without adapter', () => {
      repo.removeEdge({ from: 'a', to: 'b' });
      // No error thrown
    });

    it('delegates to adapter', () => {
      const edge: Edge = { from: 'a', to: 'b' };
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.removeEdge(edge);

      expect(mockAdapter.removeEdge).toHaveBeenCalledWith(edge);
    });

    it('emits edgeRemoved event', () => {
      const edge: Edge = { from: 'a', to: 'b' };
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.removeEdge(edge);

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:edgeRemoved', { edge });
    });
  });

  describe('setGraphData', () => {
    it('does nothing without adapter', () => {
      repo.setGraphData({ nodes: [], edges: [] });
      // No error thrown
    });

    it('delegates to adapter.setData', () => {
      const nodes = [createMockNode('a')];
      const edges: Edge[] = [{ from: 'a', to: 'b' }];
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.setGraphData({ nodes, edges });

      expect(mockAdapter.setData).toHaveBeenCalledWith(nodes, edges);
    });

    it('emits dataChanged event', () => {
      const nodes = [createMockNode('a')];
      const edges: Edge[] = [{ from: 'a', to: 'b' }];
      const data = { nodes, edges };
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.setGraphData(data);

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:dataChanged', { data });
    });
  });

  describe('clear', () => {
    it('does nothing without adapter', () => {
      repo.clear();
      // No error thrown
    });

    it('calls adapter.setData with empty arrays', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.clear();

      expect(mockAdapter.setData).toHaveBeenCalledWith([], []);
    });

    it('emits dataChanged event with empty data', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      repo.clear();

      expect(mockEventBus.emit).toHaveBeenCalledWith('nodeRepository:dataChanged', {
        data: { nodes: [], edges: [] },
      });
    });
  });

  describe('destroy', () => {
    it('sets adapter to null', () => {
      repo.initialize(mockAdapter as unknown as NetworkAdapter);
      expect(repo.isReady()).toBe(true);

      repo.destroy();
      expect(repo.isReady()).toBe(false);
    });
  });

  describe('getNodePosition', () => {
    it('returns null without adapter', () => {
      expect(repo.getNodePosition('a')).toBeNull();
    });

    it('returns null for non-existent node', () => {
      mockAdapter = createMockAdapter({});
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getNodePosition('nonexistent')).toBeNull();
    });

    it('returns position for existing node', () => {
      const positions = { a: { x: 100, y: 200 } };
      mockAdapter = createMockAdapter(positions);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      expect(repo.getNodePosition('a')).toEqual({ x: 100, y: 200 });
    });

    it('delegates to adapter.getPositions', () => {
      const positions = { a: { x: 100, y: 200 } };
      mockAdapter = createMockAdapter(positions);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      repo.getNodePosition('a');

      expect(mockAdapter.getPositions).toHaveBeenCalledWith(['a']);
    });
  });

  describe('getNodePositions', () => {
    it('returns empty object without adapter', () => {
      expect(repo.getNodePositions(['a', 'b'])).toEqual({});
    });

    it('returns positions for existing nodes', () => {
      const positions = {
        a: { x: 100, y: 200 },
        b: { x: 300, y: 400 },
        c: { x: 500, y: 600 },
      };
      mockAdapter = createMockAdapter(positions);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      const result = repo.getNodePositions(['a', 'b']);

      expect(result).toEqual({
        a: { x: 100, y: 200 },
        b: { x: 300, y: 400 },
      });
    });

    it('only returns positions for requested nodes', () => {
      const positions = {
        a: { x: 100, y: 200 },
        b: { x: 300, y: 400 },
      };
      mockAdapter = createMockAdapter(positions);
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      const result = repo.getNodePositions(['a']);

      expect(result).toEqual({ a: { x: 100, y: 200 } });
      expect(result).not.toHaveProperty('b');
    });

    it('delegates to adapter.getPositions', () => {
      mockAdapter = createMockAdapter({});
      repo.initialize(mockAdapter as unknown as NetworkAdapter);

      repo.getNodePositions(['a', 'b', 'c']);

      expect(mockAdapter.getPositions).toHaveBeenCalledWith(['a', 'b', 'c']);
    });
  });
});
