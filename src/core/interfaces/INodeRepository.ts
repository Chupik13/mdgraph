import type { Node, Edge, GraphData, ConnectionResult } from '../../shared/types';
import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { Position } from '../../infrastructure/vis-network/types';

export interface INodeRepository {

  getNodes(): Node[];

  getEdges(): Edge[];

  getNode(nodeId: string): Node | undefined;

  getNodeIds(): string[];

  getConnectedNodeIds(nodeId: string): ConnectionResult;

  getNodePosition(nodeId: string): Position | null;

  getNodePositions(nodeIds: string[]): Record<string, Position>;

  getRandomNode(): Node | null;

  isPhantom(nodeId: string): boolean;

  isReady(): boolean;

  addNode(node: Node): void;

  removeNode(nodeId: string): void;

  addEdge(edge: Edge): void;

  removeEdge(edge: Edge): void;

  setGraphData(data: GraphData): void;

  clear(): void;

  initialize(adapter: NetworkAdapter): void;

  destroy(): void;
}
