import type { IEventBus, INodeRepository } from '../interfaces';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { Node, Edge, GraphData, ConnectionResult } from '../../shared/types';
import type { Position } from '../../infrastructure/vis-network/types';

export class NodeRepository implements INodeRepository {
  private adapter: NetworkAdapter | null = null;
  private eventBus: IEventBus | null = null;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus ?? null;
  }

  getNodes(): Node[] {
    return this.adapter?.getNodes() ?? [];
  }

  getEdges(): Edge[] {
    return this.adapter?.getEdges() ?? [];
  }

  getNode(nodeId: string): Node | undefined {
    return this.adapter?.getNode(nodeId) ?? undefined;
  }

  getNodeIds(): string[] {
    return this.getNodes().map((n) => n.id);
  }

  getConnectedNodeIds(nodeId: string): ConnectionResult {
    const edges = this.getEdges();
    const incoming = new Set<string>();
    const outgoing = new Set<string>();

    for (const edge of edges) {
      if (edge.to === nodeId) {
        incoming.add(edge.from);
      }
      if (edge.from === nodeId) {
        outgoing.add(edge.to);
      }
    }

    return { incoming, outgoing };
  }

  getNodePosition(nodeId: string): Position | null {
    const positions = this.adapter?.getPositions([nodeId]);
    return positions?.[nodeId] ?? null;
  }

  getNodePositions(nodeIds: string[]): Record<string, Position> {
    return this.adapter?.getPositions(nodeIds) ?? {};
  }

  getRandomNode(): Node | null {
    const nodes = this.getNodes();
    if (nodes.length === 0) {
      return null;
    } 

    const randomIndex = Math.floor(Math.random() * nodes.length);
    return nodes[randomIndex] ?? null;
  }

  isPhantom(nodeId: string): boolean {
    const node = this.getNode(nodeId);
    return node?.group === 'phantom';
  }

  isReady(): boolean {
    return this.adapter !== null;
  }

  addNode(node: Node): void {
    this.adapter?.addNode(node);
    this.eventBus?.emit('nodeRepository:nodeAdded', { node });
  }

  removeNode(nodeId: string): void {
    this.adapter?.removeNode(nodeId);
    this.eventBus?.emit('nodeRepository:nodeRemoved', { nodeId });
  }

  addEdge(edge: Edge): void {
    this.adapter?.addEdge(edge);
    this.eventBus?.emit('nodeRepository:edgeAdded', { edge });
  }

  removeEdge(edge: Edge): void {
    this.adapter?.removeEdge(edge);
    this.eventBus?.emit('nodeRepository:edgeRemoved', { edge });
  }

  setGraphData(data: GraphData): void {
    this.adapter?.setData(data.nodes, data.edges);
    this.eventBus?.emit('nodeRepository:dataChanged', { data });
  }

  clear(): void {
    this.adapter?.setData([], []);
    this.eventBus?.emit('nodeRepository:dataChanged', { data: { nodes: [], edges: [] } });
  }

  initialize(adapter: NetworkAdapter): void {
    this.adapter = adapter;
  }

  destroy(): void {
    this.adapter = null;
  }
}
