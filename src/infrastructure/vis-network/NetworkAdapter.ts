import { Network, type NetworkEvents } from 'vis-network';
import { DataSet } from 'vis-data';
import type {
  NetworkInstance,
  NetworkOptions,
  NodeDataSet,
  EdgeDataSet,
  VisNode,
  VisEdge,
  Position,
  AnimationOptions,
} from './types';
import type { Node, Edge } from '../../shared/types';

export const DEFAULT_NETWORK_OPTIONS: NetworkOptions = {
  nodes: {
    shape: 'dot',
    scaling: {
      min: 10,
      max: 40,
      label: {
        enabled: true,
        min: 12,
        max: 24,
      },
    },
    font: {
      size: 14,
      face: 'JetBrains Mono, monospace',
      color: '#ffffff',
    },
    borderWidth: 1,
    borderWidthSelected: 2,
  },

  edges: {
    width: 0.3,
    color: {
      color: '#666666',
      highlight: '#999999',
      hover: '#999999',
      opacity: 0.3,
    },
    smooth: {
      enabled: true,
      type: 'continuous',
      roundness: 0.5,
    },
    hoverWidth: 2,
    selectionWidth: 2,
    arrows: {
      to: {
        enabled: false,
        scaleFactor: 0.5,
      },
    },
  },

    physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
            theta: 0.5,
            gravitationalConstant: -450,
            centralGravity: 0.01,
            springConstant: 0.08,
            springLength: 200,
            damping: 0.4,
            avoidOverlap: 0
        },
    },

  interaction: {
    hover: false,
    tooltipDelay: 200,
    navigationButtons: false,
    keyboard: false,
    selectable: false,
    dragNodes: false,
    dragView: false,
    zoomView: false,
  },

  layout: {
    improvedLayout: false,
    clusterThreshold: 150,
  },
};

export class NetworkAdapter {
  private network: NetworkInstance | null = null;
  private nodesDataSet: NodeDataSet | null = null;
  private edgesDataSet: EdgeDataSet | null = null;

  initialize(container: HTMLElement, options: NetworkOptions = DEFAULT_NETWORK_OPTIONS): NetworkInstance {
    this.nodesDataSet = new DataSet<VisNode>();
    this.edgesDataSet = new DataSet<VisEdge>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      nodes: this.nodesDataSet,
      edges: this.edgesDataSet,
    };

    this.network = new Network(container, data, options);
    return this.network;
  }

  getNetwork(): NetworkInstance | null {
    return this.network;
  }

  getNodesDataSet(): NodeDataSet | null {
    return this.nodesDataSet;
  }

  getEdgesDataSet(): EdgeDataSet | null {
    return this.edgesDataSet;
  }

  setData(nodes: Node[], edges: Edge[]): void {
    if (!this.nodesDataSet || !this.edgesDataSet) {
      throw new Error('NetworkAdapter not initialized');
    }

    this.nodesDataSet.clear();
    this.edgesDataSet.clear();

    this.nodesDataSet.add(nodes as VisNode[]);
    this.edgesDataSet.add(edges.map((e, i) => ({ ...e, id: `${e.from}-${e.to}-${i}` })));
  }

  addNode(node: Node): void {
    this.nodesDataSet?.add(node as VisNode);
  }

  removeNode(nodeId: string): void {
    this.nodesDataSet?.remove(nodeId);
  }

  updateNode(node: Partial<VisNode> & { id: string }): void {
    this.nodesDataSet?.update(node);
  }

  updateNodes(nodes: Array<Partial<VisNode> & { id: string }>): void {
    this.nodesDataSet?.update(nodes);
  }

  addEdge(edge: Edge): void {
    const id = `${edge.from}-${edge.to}-${Date.now()}`;
    this.edgesDataSet?.add({ ...edge, id } as VisEdge);
  }

  removeEdge(edge: Edge): void {
    const edges = this.edgesDataSet?.get({
      filter: (e) => e.from === edge.from && e.to === edge.to,
    });
    if (edges && edges.length > 0) {
      const edgeId = edges[0]?.id;
      if (edgeId) {
        this.edgesDataSet?.remove(edgeId);
      }
    }
  }

  getNodes(): VisNode[] {
    return this.nodesDataSet?.get() ?? [];
  }

  getEdges(): VisEdge[] {
    return this.edgesDataSet?.get() ?? [];
  }

  getNode(nodeId: string): VisNode | null {
    return this.nodesDataSet?.get(nodeId) ?? null;
  }

  getPositions(nodeIds?: string[]): Record<string, Position> {
    if (!this.network) return {};
    return this.network.getPositions(nodeIds);
  }

  focusOnNode(nodeId: string, scale: number = 1.0, animation?: AnimationOptions): void {
    const defaultAnimation = { duration: 300, easingFunction: 'easeInOutQuad' as const };
    this.network?.focus(nodeId, {
      scale,
      animation: animation ? { duration: animation.duration ?? 300, easingFunction: animation.easingFunction ?? 'easeInOutQuad' } : defaultAnimation,
    });
  }

  fitToNodes(nodeIds?: string[], animation?: AnimationOptions): void {
    const defaultAnimation = { duration: 300, easingFunction: 'easeInOutQuad' as const };
    const allNodes = this.getNodes().map((node) => node.id as string);
    if(!nodeIds) {
      nodeIds = allNodes;
    }
    console.log(nodeIds);
    this.network?.fit({
      nodes: nodeIds,
      animation: animation ? { duration: animation.duration ?? 300, easingFunction: animation.easingFunction ?? 'easeInOutQuad' } : defaultAnimation,
    });
  }

  getScale(): number {
    return this.network?.getScale() ?? 1;
  }

  getViewPosition(): Position {
    return this.network?.getViewPosition() ?? { x: 0, y: 0 };
  }

  moveTo(position: Position, scale?: number, animation?: AnimationOptions): void {
    const defaultAnimation = { duration: 300, easingFunction: 'easeInOutQuad' as const };
    this.network?.moveTo({
      position,
      scale,
      animation: animation ? { duration: animation.duration ?? 300, easingFunction: animation.easingFunction ?? 'easeInOutQuad' } : defaultAnimation,
    });
  }

  setPhysics(enabled: boolean): void {
    this.network?.setOptions({ physics: { enabled } });
  }

  selectNodes(nodeIds: string[]): void {
    this.network?.selectNodes(nodeIds);
  }

  unselectAll(): void {
    this.network?.unselectAll();
  }

  on(event: NetworkEvents, callback: (params: unknown) => void): void {
    this.network?.on(event, callback);
  }

  off(event: NetworkEvents, callback: (params: unknown) => void): void {
    this.network?.off(event, callback);
  }

  destroy(): void {
    this.network?.destroy();
    this.network = null;
    this.nodesDataSet = null;
    this.edgesDataSet = null;
  }
}
