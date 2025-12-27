import type { Network, Options, Data } from 'vis-network';
import type { DataSet } from 'vis-data';
import type { Node, Edge } from '../../shared/types';

export interface VisNode extends Node {
  color?: {
    background: string;
    border: string;
    highlight?: {
      background: string;
      border: string;
    };
  };
  borderWidth?: number;
  borderDashes?: boolean | number[];
  opacity?: number;
  font?: {
    color?: string;
    size?: number;
  };
}

export interface VisEdge extends Edge {
  id?: string;
  color?: string;
  width?: number;
}

export type NodeDataSet = DataSet<VisNode>;
export type EdgeDataSet = DataSet<VisEdge>;

export type NetworkInstance = Network;
export type NetworkOptions = Options;
export type NetworkData = Data;

export interface Position {
  x: number;
  y: number;
}

export interface AnimationOptions {
  duration?: number;
  easingFunction?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
}
