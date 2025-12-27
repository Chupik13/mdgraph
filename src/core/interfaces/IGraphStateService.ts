export interface GraphState {
  focusedNodeId: string | null;
  selectedNodeId: string | null;
  activeNodeIds: Set<string>;
  incomingNodeIds: Set<string>;
  outgoingNodeIds: Set<string>;
  phantomNodeIds: Set<string>;
}

export interface IGraphStateService {
  getState(): GraphState;

  getFocusedNodeId(): string | null;

  getSelectedNodeId(): string | null;

  getActiveNodeIds(): Set<string>;

  getIncomingNodeIds(): Set<string>;

  getOutgoingNodeIds(): Set<string>;

  getConnectedNodeIds(): Set<string>;

  getPhantomNodeIds(): Set<string>;

  setFocusedNode(nodeId: string | null): void;

  selectNode(nodeId: string): void;

  unselectNode(): void;

  setActiveNodes(nodeIds: Set<string>): void;

  setPhantomNodes(nodeIds: Set<string>): void;

  subscribe(listener: () => void): () => void;

  reset(): void;
}
