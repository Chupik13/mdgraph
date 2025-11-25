/**
 * vis-network configuration and styling utilities.
 *
 * This module provides the complete configuration for vis-network graph visualization,
 * including node appearance, edge styling, physics simulation, and interaction settings.
 * All visual parameters are centralized here for consistent graph appearance.
 *
 * @module features/graph/utils/visNetworkConfig
 */

import type { Options } from 'vis-network';

/**
 * Returns complete vis-network configuration options.
 *
 * Provides a comprehensive configuration object for vis-network that defines:
 * - Node appearance (size, shape, font, colors)
 * - Edge styling (width, color, smoothing, arrows)
 * - Physics simulation (force-directed layout)
 * - User interaction settings (disabled by default for custom controls)
 * - Layout optimizations
 *
 * @returns Complete vis-network Options object ready for network instantiation
 *
 * @remarks
 * ## Node Configuration
 * - **Shape**: Dot (circular) nodes
 * - **Scaling**: Dynamic sizing from 10-40px based on value (backlink count)
 * - **Font**: JetBrains Mono monospace font for code-like appearance
 * - **Colors**: Set per-node via styling functions, not in global config
 *
 * ## Edge Configuration
 * - **Width**: Very thin (0.3px) for minimal visual weight
 * - **Color**: Subtle gray with low opacity
 * - **Smooth**: Continuous curves with 0.5 roundness
 * - **Arrows**: Disabled (undirected appearance despite directed edges)
 *
 * ## Physics Simulation
 * - **Solver**: ForceAtlas2Based (good balance of speed and quality)
 * - **Initial state**: Enabled to arrange nodes on first load
 * - **Auto-disable**: Physics is disabled after stabilization (handled in useGraphNetwork)
 * - **Parameters**: Tuned for readable spacing and natural clustering
 *
 * ## Interaction Settings
 * All default interactions are **disabled** to allow custom keyboard and mouse handling:
 * - No hover tooltips
 * - No navigation buttons
 * - No keyboard controls
 * - No node/view dragging
 * - No zoom controls
 *
 * This gives full control to custom interaction handlers for vim-like navigation.
 *
 * @example
 * const options = getVisNetworkOptions();
 * const network = new Network(container, data, options);
 *
 * @example
 * // Customize returned options
 * const options = {
 *   ...getVisNetworkOptions(),
 *   interaction: {
 *     ...getVisNetworkOptions().interaction,
 *     hover: true, // Enable hover if needed
 *   },
 * };
 */
export const getVisNetworkOptions = (): Options => ({
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
});

/**
 * Re-exports node styling functions from the coloring feature.
 *
 * These functions return style objects that can be spread onto node data
 * to apply specific visual appearances based on node state and type.
 */
export {
  getPhantomNodeStyle,
  getRegularNodeStyle,
  getSelectedNodeStyle,
  getOutgoingNodeStyle,
  getIncomingNodeStyle,
} from '../../coloring';
