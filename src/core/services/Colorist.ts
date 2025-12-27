import type { IColorist, ColorScheme, NodeColors, IEventBus, IGraphStateService } from '../interfaces';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { VisNode } from '../../infrastructure/vis-network/types';

const DEFAULT_COLORS: ColorScheme = {
  selected: { border: '#72f0c2', background: '#45b592' },
  focused: { border: '#ffffff', background: '#383961' },
  outgoing: { border: '#ab1125', background: '#db172f' },
  incoming: { border: '#adb088', background: '#dbdfac' },
  phantom: { border: '#3b1f2b', background: '#3b1f2b' },
  regular: { border: '#2e2e4f', background: '#383961' },
};

export class Colorist implements IColorist {
  private adapter: NetworkAdapter | null = null;
  private colors: ColorScheme = { ...DEFAULT_COLORS };
  private unsubscribers: Array<() => void> = [];

  private prevFocusedId: string | null = null;
  private prevSelectedId: string | null = null;
  private prevIncomingIds: Set<string> = new Set();
  private prevOutgoingIds: Set<string> = new Set();
  private prevPhantomIds: Set<string> = new Set();

  constructor(
    private eventBus: IEventBus,
    private graphState: IGraphStateService
  ) {}

  initialize(adapter: NetworkAdapter): void {
    this.adapter = adapter;

    this.unsubscribers.push(
      this.eventBus.on('graphState:selectionChanged', () => this.applyColorsDiff()),
      this.eventBus.on('graphState:phantomNodesChanged', () => this.applyColorsDiff()),
      this.eventBus.on('graphState:focusChanged', () => this.applyColorsDiff()),
      this.eventBus.on('graphState:reset', () => this.applyColorsAll()),
      this.eventBus.on('nodeRepository:dataChanged', () => this.applyColorsAll())
    );

    this.applyColorsAll();
  }

  applyColors(): void {
    this.applyColorsAll();
  }

  setColorScheme(colors: Partial<ColorScheme>): void {
    this.colors = { ...this.colors, ...colors };
    this.applyColorsAll();
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.adapter = null;
    this.clearPrevState();
  }

  private applyColorsAll(): void {
    if (!this.adapter) return;

    const nodes = this.adapter.getNodes();
    if (nodes.length === 0) return;

    const state = this.graphState.getState();
    const { focusedNodeId, selectedNodeId, incomingNodeIds, outgoingNodeIds, phantomNodeIds } = state;

    const updates: Array<Partial<VisNode> & { id: string }> = [];

    for (const node of nodes) {
      const isFocused = focusedNodeId === node.id;
      const color = this.getNodeColor(
        node.id,
        focusedNodeId,
        selectedNodeId,
        incomingNodeIds,
        outgoingNodeIds,
        phantomNodeIds,
        node.group
      );

      updates.push({
        id: node.id,
        color: {
          background: color.background,
          border: color.border,
        },
        borderDashes: isFocused ? [5, 5] : false,
        borderWidth: isFocused ? 2 : 1,
      });
    }

    this.adapter.updateNodes(updates);
    this.savePrevState(focusedNodeId, selectedNodeId, incomingNodeIds, outgoingNodeIds, phantomNodeIds);
  }

  private applyColorsDiff(): void {
    if (!this.adapter) {
      return;
    }

    const state = this.graphState.getState();
    const { focusedNodeId, selectedNodeId, incomingNodeIds, outgoingNodeIds, phantomNodeIds } = state;

    // Calculate changed node IDs
    const changedIds = new Set<string>();

    // Handle focused node change
    if (this.prevFocusedId !== focusedNodeId) {
      if (this.prevFocusedId) changedIds.add(this.prevFocusedId);
      if (focusedNodeId) changedIds.add(focusedNodeId);
    }

    // Handle selected node change
    if (this.prevSelectedId !== selectedNodeId) {
      if (this.prevSelectedId) changedIds.add(this.prevSelectedId);
      if (selectedNodeId) changedIds.add(selectedNodeId);
    }

    this.addSymmetricDiff(changedIds, this.prevIncomingIds, incomingNodeIds);
    this.addSymmetricDiff(changedIds, this.prevOutgoingIds, outgoingNodeIds);
    this.addSymmetricDiff(changedIds, this.prevPhantomIds, phantomNodeIds);

    if (changedIds.size === 0) return;

    const updates: Array<Partial<VisNode> & { id: string }> = [];

    for (const nodeId of changedIds) {
      const node = this.adapter.getNode(nodeId);
      if (!node) continue;

      const isFocused = focusedNodeId === nodeId;
      const color = this.getNodeColor(
        nodeId,
        focusedNodeId,
        selectedNodeId,
        incomingNodeIds,
        outgoingNodeIds,
        phantomNodeIds,
        node.group
      );

      updates.push({
        id: nodeId,
        color: {
          background: color.background,
          border: color.border,
        },
        borderDashes: isFocused ? [5, 5] : false,
        borderWidth: isFocused ? 2 : 1,
      });
    }

    if (updates.length > 0) {
      this.adapter.updateNodes(updates);
    }

    this.savePrevState(focusedNodeId, selectedNodeId, incomingNodeIds, outgoingNodeIds, phantomNodeIds);
  }

  private addSymmetricDiff(result: Set<string>, prev: Set<string>, current: Set<string>): void {
    for (const id of prev) {
      if (!current.has(id)) result.add(id);
    }
    for (const id of current) {
      if (!prev.has(id)) result.add(id);
    }
  }

  private savePrevState(
    focusedNodeId: string | null,
    selectedNodeId: string | null,
    incomingNodeIds: Set<string>,
    outgoingNodeIds: Set<string>,
    phantomNodeIds: Set<string>
  ): void {
    this.prevFocusedId = focusedNodeId;
    this.prevSelectedId = selectedNodeId;
    this.prevIncomingIds = new Set(incomingNodeIds);
    this.prevOutgoingIds = new Set(outgoingNodeIds);
    this.prevPhantomIds = new Set(phantomNodeIds);
  }

  private clearPrevState(): void {
    this.prevFocusedId = null;
    this.prevSelectedId = null;
    this.prevIncomingIds = new Set();
    this.prevOutgoingIds = new Set();
    this.prevPhantomIds = new Set();
  }

  private getNodeColor(
    nodeId: string,
    focusedNodeId: string | null,
    selectedNodeId: string | null,
    incomingNodeIds: Set<string>,
    outgoingNodeIds: Set<string>,
    phantomNodeIds: Set<string>,
    group: string | null | undefined
  ): NodeColors {
    // Selected has highest priority
    if (selectedNodeId === nodeId) {
      return this.colors.selected;
    }
    // Focused node (not selected) gets white dashed border
    if (focusedNodeId === nodeId) {
      return this.colors.focused;
    }
    if (outgoingNodeIds.has(nodeId)) {
      return this.colors.outgoing;
    }
    if (incomingNodeIds.has(nodeId)) {
      return this.colors.incoming;
    }
    if (phantomNodeIds.has(nodeId) || group === 'phantom') {
      return this.colors.phantom;
    }
    return this.colors.regular;
  }
}
