import { describe, it, expect, vi } from 'vitest';
import { createContainer } from '../di/createContainer';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { Node, Edge } from '../../shared/types';
import type { VisNode } from '../../infrastructure/vis-network/types';

const createMockNode = (id: string, group: 'phantom' | null = null): Node => ({
  id,
  label: id.toUpperCase(),
  value: 1,
  group,
  file_path: group === 'phantom' ? '' : `/path/${id}.md`,
  hashtags: [],
});

const createMockAdapter = (nodes: Node[] = [], edges: Edge[] = []) => ({
  getNodes: vi.fn(() => nodes as VisNode[]),
  getEdges: vi.fn(() => edges),
  getNode: vi.fn((id: string) => nodes.find((n) => n.id === id) as VisNode | null),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  addEdge: vi.fn(),
  removeEdge: vi.fn(),
  setData: vi.fn(),
  updateNodes: vi.fn(),
  initialize: vi.fn(),
  destroy: vi.fn(),
});

describe('Integration Tests', () => {
  describe('GraphStateService + NodeRepository', () => {
    it('computes incoming and outgoing nodes on selectNode', () => {
      const nodes = [createMockNode('a'), createMockNode('b'), createMockNode('c')];
      const edges: Edge[] = [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);

      graphState.selectNode('b');

      expect(graphState.getIncomingNodeIds()).toEqual(new Set(['a']));
      expect(graphState.getOutgoingNodeIds()).toEqual(new Set(['c']));
    });

    it('replaces selection when selecting another node', () => {
      const nodes = [
        createMockNode('a'),
        createMockNode('b'),
        createMockNode('c'),
        createMockNode('d'),
      ];
      const edges: Edge[] = [
        { from: 'a', to: 'b' },
        { from: 'c', to: 'd' },
      ];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);

      graphState.selectNode('b');
      expect(graphState.getSelectedNodeId()).toBe('b');
      expect(graphState.getIncomingNodeIds()).toEqual(new Set(['a']));

      graphState.selectNode('d');
      expect(graphState.getSelectedNodeId()).toBe('d');
      expect(graphState.getIncomingNodeIds()).toEqual(new Set(['c']));
    });
  });

  describe('Colorist + GraphStateService', () => {
    it('colors nodes when selection changes', () => {
      const nodes = [createMockNode('a'), createMockNode('b')];
      const edges: Edge[] = [];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      graphState.selectNode('a');

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      const nodeA = updates.find((u: { id: string }) => u.id === 'a');
      expect(nodeA.color).toEqual({ background: '#45b592', border: '#72f0c2' });
    });

    it('recolors nodes when selection is cleared', () => {
      const nodes = [createMockNode('a')];
      const mockAdapter = createMockAdapter(nodes, []);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      graphState.selectNode('a');
      mockAdapter.updateNodes.mockClear();

      graphState.unselectNode();

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      const nodeA = updates.find((u: { id: string }) => u.id === 'a');
      expect(nodeA.color).toEqual({ background: '#383961', border: '#2e2e4f' });
    });
  });

  describe('Full selection flow', () => {
    it('colors selected, incoming, and outgoing nodes correctly', () => {
      const nodes = [createMockNode('a'), createMockNode('b'), createMockNode('c')];
      const edges: Edge[] = [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      graphState.selectNode('b');

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
      const updates = mockAdapter.updateNodes.mock.calls[0][0];

      const nodeA = updates.find((u: { id: string }) => u.id === 'a');
      const nodeB = updates.find((u: { id: string }) => u.id === 'b');
      const nodeC = updates.find((u: { id: string }) => u.id === 'c');

      // 'b' is selected (green)
      expect(nodeB.color).toEqual({ background: '#45b592', border: '#72f0c2' });
      // 'a' is incoming (yellow/green)
      expect(nodeA.color).toEqual({ background: '#dbdfac', border: '#adb088' });
      // 'c' is outgoing (red)
      expect(nodeC.color).toEqual({ background: '#db172f', border: '#ab1125' });
    });

    it('handles complex graph with multiple incoming/outgoing', () => {
      const nodes = [
        createMockNode('a'),
        createMockNode('b'),
        createMockNode('c'),
        createMockNode('d'),
        createMockNode('e'),
      ];
      const edges: Edge[] = [
        { from: 'a', to: 'c' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'd' },
        { from: 'c', to: 'e' },
      ];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      graphState.selectNode('c');

      const updates = mockAdapter.updateNodes.mock.calls[0][0];

      expect(updates).toHaveLength(5);

      const findNode = (id: string) => updates.find((u: { id: string }) => u.id === id);

      expect(findNode('c').color).toEqual({ background: '#45b592', border: '#72f0c2' }); // selected
      expect(findNode('a').color).toEqual({ background: '#dbdfac', border: '#adb088' }); // incoming
      expect(findNode('b').color).toEqual({ background: '#dbdfac', border: '#adb088' }); // incoming
      expect(findNode('d').color).toEqual({ background: '#db172f', border: '#ab1125' }); // outgoing
      expect(findNode('e').color).toEqual({ background: '#db172f', border: '#ab1125' }); // outgoing
    });
  });

  describe('dataChanged triggers full repaint', () => {
    it('repaints all nodes when setGraphData is called', () => {
      const nodes = [createMockNode('a'), createMockNode('b')];
      const mockAdapter = createMockAdapter(nodes, []);

      const { nodeRepository, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      nodeRepository.setGraphData({ nodes: [createMockNode('x')], edges: [] });

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
    });
  });

  describe('reset triggers full repaint', () => {
    it('resets all colors to regular on graphState.reset()', () => {
      const nodes = [createMockNode('a'), createMockNode('b'), createMockNode('c')];
      const edges: Edge[] = [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      graphState.selectNode('b');
      mockAdapter.updateNodes.mockClear();

      graphState.reset();

      expect(mockAdapter.updateNodes).toHaveBeenCalled();
      const updates = mockAdapter.updateNodes.mock.calls[0][0];

      for (const update of updates) {
        expect(update.color).toEqual({ background: '#383961', border: '#2e2e4f' });
      }
    });
  });

  describe('Incremental updates in Colorist', () => {
    it('only updates changed nodes on selection change', () => {
      const nodes = [
        createMockNode('a'),
        createMockNode('b'),
        createMockNode('c'),
        createMockNode('d'),
      ];
      const edges: Edge[] = [{ from: 'a', to: 'b' }];
      const mockAdapter = createMockAdapter(nodes, edges);

      const { nodeRepository, graphState, colorist } = createContainer();
      nodeRepository.initialize(mockAdapter as unknown as NetworkAdapter);
      colorist.initialize(mockAdapter as unknown as NetworkAdapter);

      mockAdapter.updateNodes.mockClear();

      // Select 'b' - should update 'a' (incoming), 'b' (selected)
      graphState.selectNode('b');

      const updates = mockAdapter.updateNodes.mock.calls[0][0];
      const updatedIds = updates.map((u: { id: string }) => u.id);

      expect(updatedIds).toContain('a');
      expect(updatedIds).toContain('b');
      // 'c' and 'd' have no relation to 'b', should not be updated
      expect(updatedIds).not.toContain('c');
      expect(updatedIds).not.toContain('d');
    });
  });
});
