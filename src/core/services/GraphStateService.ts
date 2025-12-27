import { createStore, type StoreApi } from 'zustand/vanilla';
import type { IGraphStateService, GraphState, IEventBus, INodeRepository } from '../interfaces';

export class GraphStateService implements IGraphStateService {
  private store: StoreApi<GraphState>;

  constructor(private eventBus: IEventBus, private nodeRepository: INodeRepository) {
    this.store = createStore<GraphState>(() => ({
      focusedNodeId: null,
      selectedNodeId: null,
      activeNodeIds: new Set(),
      incomingNodeIds: new Set(),
      outgoingNodeIds: new Set(),
      phantomNodeIds: new Set(),
    }));
  }

  getState(): GraphState {
    return this.store.getState();
  }

  getFocusedNodeId(): string | null {
    return this.store.getState().focusedNodeId;
  }

  getSelectedNodeId(): string | null {
    return this.store.getState().selectedNodeId;
  }

  getActiveNodeIds(): Set<string> {
    return this.store.getState().activeNodeIds;
  }

  getIncomingNodeIds(): Set<string> {
    return this.store.getState().incomingNodeIds;
  }

  getOutgoingNodeIds(): Set<string> {
    return this.store.getState().outgoingNodeIds;
  }

  getConnectedNodeIds(): Set<string> {
    const state = this.store.getState();
    return new Set([...state.incomingNodeIds, ...state.outgoingNodeIds]);
  }

  getPhantomNodeIds(): Set<string> {
    return this.store.getState().phantomNodeIds;
  }

  setFocusedNode(nodeId: string | null): void {
    const prev = this.getFocusedNodeId();
    this.store.setState({ focusedNodeId: nodeId });
    this.eventBus.emit('graphState:focusChanged', { prev, current: nodeId });
  }

  selectNode(nodeId: string): void {
    const { incoming, outgoing } = this.nodeRepository.getConnectedNodeIds(nodeId);

    this.store.setState({
      selectedNodeId: nodeId,
      incomingNodeIds: incoming,
      outgoingNodeIds: outgoing,
    });

    this.eventBus.emit('graphState:selectionChanged', { selectedNodeId: nodeId });
  }

  unselectNode(): void {
    this.store.setState({
      selectedNodeId: null,
      incomingNodeIds: new Set(),
      outgoingNodeIds: new Set(),
    });

    this.eventBus.emit('graphState:selectionChanged', { selectedNodeId: null });
  }

  setActiveNodes(nodeIds: Set<string>): void { 
    this.store.setState({ activeNodeIds: nodeIds });
    this.eventBus.emit('graphState:activeNodesChanged', { activeNodeIds: nodeIds });
  }

  setPhantomNodes(nodeIds: Set<string>): void {
    this.store.setState({ phantomNodeIds: nodeIds });
    this.eventBus.emit('graphState:phantomNodesChanged', { phantomNodeIds: nodeIds });
  }

  subscribe(listener: () => void): () => void {
    return this.store.subscribe(listener);
  }

  reset(): void {
    this.store.setState({
      focusedNodeId: null,
      selectedNodeId: null,
      activeNodeIds: new Set(),
      incomingNodeIds: new Set(),
      outgoingNodeIds: new Set(),
      phantomNodeIds: new Set(),
    });
    this.eventBus.emit('graphState:reset', {});
  }
}
